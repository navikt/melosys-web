# 6. Arkitektur for Årsavregning (Uten/Delt Grunnlag)

*   Status: Godkjent
*   Dato: 2024-04-08

## Kontekst

Komponenten `aarsavregningUtenEllerDeltGrunnlag` representerer et steg i behandlingen hvor saksbehandler vurderer og fastsetter årsavregning for medlemskap i folketrygden. Steget håndterer to hovedscenarioer:

*   **Uten Grunnlag:** Ingen tidligere relevant behandling finnes i Melosys. Saksbehandler må legge inn all nødvendig informasjon manuelt, inkludert valg av `bestemmelse`, `medlemskapsperioder`, `skatteforholdsperioder`, og `inntektsperioder`.
*   **Delt Grunnlag:** En tidligere behandling (opprinnelig grunnlag) finnes. Skjemaet preutfylles med data fra denne behandlingen. Spesielt replikeres `medlemskapsperioder` fra det opprinnelige grunnlaget, og disse er *låst* for redigering/sletting. Saksbehandler kan kun legge til *nye* medlemskapsperioder og redigere/slette disse nye periodene. `Skatteforholdsperioder` og `inntektsperioder` må også vurderes og potensielt justeres/legges til.

Avhengig av scenario, innebærer steget:
*   Valg av relevant bestemmelse (dersom _uten grunnlag_)
*   Dynamisk administrasjon av periodelister (`medlemskapsperioder`, `skatteforholdsperioder`, `inntektsperioder`) via `useFieldArray`.
*   Fortløpende validering (enkeltfelter via RHF/Zod, komplekse sammenhenger som gap/overlapp i `medlemskapsperioder` via custom logikk).
*   Automatisk, debounced lagring av endringer i *nye/endrede* `medlemskapsperioder` til backend.
*   Automatisk, debounced beregning av total avgift basert på alle relevante input (`medlemskapsperioder`, `skatteforholdsperioder`, `inntektsperioder`, bestemmelse, forskudd etc.).
*   Synkronisering av state mellom frontend (RHF) og backend.
*   Oppdatering av behandlingsstatus.

Kompleksiteten ligger i state-håndtering for dynamiske lister, samspillet mellom RHF og lokal state (`lagredeMedlemskapsperioder`), håndtering av låste vs. editerbare perioder (i Delt Grunnlag), og orkestrering av flere asynkrone, debounced operasjoner (lagring av medlemskap, beregning av avgift) som avhenger av hverandre og av valideringsstatus.

**Hovedutfordringer:**
*   Korrekt synkronisering mellom RHF-state og sist lagret state for `medlemskapsperioder`.
*   Effektiv automatisk lagring (kun for `medlemskapsperioder`) og beregning uten API-overbelastning.
*   Robust håndtering av avhengigheter (endringer i perioder/bestemmelse -> validering -> lagring/beregning).
*   Korrekt håndtering av sletting/redigering i "Uten Grunnlag" vs. "Delt Grunnlag" (låste perioder).
*   Validering av alle periodetyper.

## Beslutning

Løsningen er en lagdelt arkitektur sentrert rundt `useAarsavregningForm`, som bruker RHF og spesialiserte custom hooks.

### Overordnet Struktur og Avhengigheter

```mermaid
graph LR
    subgraph Visning
        UI(aarsavregningUtenEllerDeltGrunnlag.tsx);
        FormUI(aarsavregningUtenEllerDeltGrunnlagForm.tsx);
    end;

    subgraph "Kjerne Logikk + State"
        FormHook(useAarsavregningForm\n- RHF Instans alle felt inkl periodelister\n- lagredeMedlemskapsperioder\n- lagreMedlemskapPaagar\n- endrerBestemmelse\n- arrayValideringsfeil);
    end;

    subgraph "Spesialiserte Hooks - Logikk og API"
        LagringTrigger(useMedlemskapLagringTrigger\n- Debounced Lagring Kun Medlemskap\n- Endringsdeteksjon Medlemskap\n- Periode Validering Medlemskap);
        BeregningTrigger(useBeregningTrigger\n- Reagerer på RHF-endringer alle perioder etc\n- Skjema Validering);
        MedlemskapApi(useMedlemskapsperioder\n- CRUD API Medlemskap\n- ID-basert diffing før PUT);
        DebouncedBeregning(useDebouncedBeregning\n- Debounced Beregning API);
    end;

    subgraph Verktøy/Lib
        RHFLib[React Hook Form Bibliotek];
        FormUtils(formUtils.ts\n- HarBrukerendringer);
        ValideringUtils(valideringsfeil.tsx\n- Gap/Overlapp sjekk);
        BackendApi[Backend API];
        DebounceLib[lodash.debounce];
        Schema(Schema.jsx\n- RHF Zod Schema alle felt);
    end;

    UI --> FormHook("Initialiserer");
    UI --> FormUI("Rendrer");
    FormHook -- "Kontrollerer" --> FormUI("Props RHF methods state callbacks");
    FormHook -- "Bruker" --> RHFLib("useForm, useFieldArray x3");
    FormHook -- "Bruker" --> Schema("Valideringsregler");
    FormHook -- "Gir props til" --> LagringTrigger;
    FormHook -- "Gir props til" --> BeregningTrigger;
    FormHook -- "Kaller direkte ved slett medlemskap" --> MedlemskapApi;

    LagringTrigger -- "Leser/Validerer" --> RHFLib("medlemskapsperioder, trigger");
    LagringTrigger -- "Bruker" --> FormUtils;
    LagringTrigger -- "Bruker" --> ValideringUtils;
    LagringTrigger -- "Kaller" --> MedlemskapApi;
    LagringTrigger -- "Bruker" --> DebounceLib;

    BeregningTrigger -- "Leser/Validerer" --> RHFLib("watch alle perioder etc, trigger");
    BeregningTrigger -- "Kaller" --> DebouncedBeregning;

    MedlemskapApi -- "Kaller" --> BackendApi;
    DebouncedBeregning -- "Kaller" --> BackendApi;
    DebouncedBeregning -- "Bruker" --> DebounceLib;

    FormUI -- "Bruker RHF Context" --> RHFLib("useFormContext");
```

### State Management

State håndteres primært av RHF (for alle skjemafelt inkl. periodelistene) og supplert med lokal state i `useAarsavregningForm` for å håndtere den spesifikke logikken rundt lagring og synkronisering av `medlemskapsperioder`.

```mermaid
graph TD
    subgraph "useAarsavregningForm - Sentral State"
        RHFState["RHF Form State - via useForm\n(Inneholder medlemskaps-, skatteforholds-, og inntektsperioder + andre felt)"];
        LagredeMedlemskap["lagredeMedlemskapsperioder - Sist lagret fasit\n(Kun for medlemskapsperioder, brukes for diffing)"];
        LagringMedlemskapPaagar["lagreMedlemskapPaagar - boolean\n(Styrer medlemskap-lagring)"];
        EndrerBestemmelse["endrerBestemmelse - boolean\n(Styrer triggere ved endring)"];
        ArrayValideringsfeil["arrayValideringsfeil - string eller undefined\n(For medlemskap gap/overlapp)"];
    end;

    subgraph "RHF Library [React Hook Form Bibliotek]"
        InternRHFState[Intern RHF State - verdier, touched, errors, etc];
    end;

    subgraph "useMedlemskapsperioder [useMedlemskapsperioder]"
        ApiFeilmelding[feilmelding - string eller undefined, for API-feil];
    end;
    
    RHFState <--> InternRHFState("useForm returnerer metoder for å lese/skrive");
    FormHook("useAarsavregningForm") -- "Setter/Leser" --> RHFState;
    FormHook -- "Setter/Leser" --> LagredeMedlemskap;
    FormHook -- "Setter/Leser" --> LagringMedlemskapPaagar;
    FormHook -- "Setter/Leser" --> EndrerBestemmelse;
    FormHook -- "Setter/Leser" --> ArrayValideringsfeil;
    LagringTrigger("useMedlemskapLagringTrigger") -- "Leser" --> LagredeMedlemskap("via props");
    LagringTrigger -- "Setter" --> LagringMedlemskapPaagar("via callback prop");
    LagringTrigger -- "Setter" --> ArrayValideringsfeil("via callback prop");
    MedlemskapApiHook("useMedlemskapsperioder") -- "Setter" --> ApiFeilmelding;
    FormHook -- "Leser" --> ApiFeilmelding("via hook return");
```

**Flyt av State:**
1.  Bruker interagerer med `FormUI` (endrer felt, legger til/fjerner i periodelister via `useFieldArray` actions). RHF oppdaterer sin interne state (`InternRHFState`).
2.  `useAarsavregningForm` lytter til RHF state (`RHFState`).
3.  **Medlemskapsperioder:** Endringer i `medlemskapsperioder` (i `RHFState`/`InternRHFState`) får `LagringTrigger` til å reagere. Den leser `lagredeMedlemskapsperioder` (`LagredeMedlemskap`) for å sjekke for reelle endringer. Ved gyldige endringer (etter validering) og debounce, kalles API. Ved suksess oppdateres *både* `lagredeMedlemskapsperioder` (`LagredeMedlemskap`) og RHF state (`RHFState`/`InternRHFState`).
4.  **Alle Perioder / Andre Felt:** Endringer i *alle* felt som `BeregningTrigger` lytter på (inkl. `medlemskapsperioder`, `skatteforholdsperioder`, `inntektsperioder`, `bestemmelse`, etc.) i `RHFState`/`InternRHFState` får `BeregningTrigger` til å reagere. Etter validering og debounce kalles beregnings-API. Resultatet oppdaterer relevante felt i RHF state (`RHFState`/`InternRHFState`).
5.  `Skatteforholdsperioder` og `inntektsperioder` valideres primært via RHF/Zod-skjemaet. Deres lagring skjer sannsynligvis ved *full innsending* av steget, ikke automatisk/debounced slik som `medlemskapsperioder`. (Antagelse - må verifiseres om det er et eget lagrings-API for disse som brukes annerledes).
6.  Valideringsfeil fra RHF/Zod bor i `InternRHFState`. Gap/overlapp-feil for medlemskap settes i `ArrayValideringsfeil`. API-feil fra medlemskap-lagring settes i `ApiFeilmelding`.

### Hovedkomponenter og Hooks (Detaljer)

1.  **Hovedkomponenter:** (`.tsx` og `Form.tsx`). `Form.tsx` rendrer `useFieldArray`-kontroller for alle tre periodetypene. For "Delt Grunnlag" vil UI-logikk (basert på props/state fra `FormHook`) deaktivere knapper for redigering/sletting av de opprinnelige, låste `medlemskapsperiodene`.
2.  **Sentral Hook (`useAarsavregningForm`):** Initialiserer RHF med `useFieldArray` for `medlemskapsperioder`, `skatteforholdsperioder`, og `inntektsperioder`. Håndterer logikk for å identifisere låste perioder i "Delt Grunnlag". Orkestrerer triggere.
3.  **Spesialiserte Hooks:**
    *   `useMedlemskapsperioder`: Som før, fokusert på CRUD for medlemskap.
    *   `useMedlemskapLagringTrigger`: Som før, fokusert på *kun* automatisk lagring av `medlemskapsperioder`.
    *   `useDebouncedBeregning`: Som før.
    *   `useBeregningTrigger`: Viktig: Lytter (`watch`) på endringer i *alle* felt som påvirker beregningen, inkludert `medlemskapsperioder`, `skatteforholdsperioder`, `inntektsperioder`, og `bestemmelse`. Trigger RHF-validering for *hele* skjemaet før den kaller beregnings-API (debounced).
4.  **RHF & Validering:** Zod-skjemaet (`Schema.jsx`) validerer struktur og grunnleggende regler for alle felt, inkludert alle periodelistene. Egen validering (`ValideringUtils`) brukes *kun* for gap/overlapp i `medlemskapsperioder`.
5.  **Endringsdeteksjon & State Sync (Medlemskap):** Som beskrevet tidligere, kritisk for å holde RHF og `lagredeMedlemskapsperioder` synkronisert.
6.  **Lagring (Skatteforhold/Inntekt):** Antas å skje ved innsending av hele steget, ikke via automatisk debounce.

### Spesifikk Interaksjon: Endring av Bestemmelse

*(Uendret fra forrige versjon - pauser triggere, lagrer medlemskap umiddelbart, trigger ny beregning etterpå)*

## Dataflyt (Fokus på Perioder -> Beregning)

```mermaid
sequenceDiagram
    participant Bruker
    participant RHF_FormUI as RHF / FormUI
    participant LagringTrigger
    participant FormUtils
    participant ValideringUtils
    participant MedlemskapApi
    participant FormHook
    participant BeregningTrigger
    participant DebouncedBeregning
    participant Backend

    alt Endring i Medlemskapsperiode P' (Krever lagring + beregning)
        Bruker->>RHF_FormUI: Endrer Medlemskapsperiode P'
        RHF_FormUI->>LagringTrigger: useEffect reagerer (RHF.medlemskapsperioder endret)
        LagringTrigger->>FormHook: Henter FormHook.lagredeMedlemskapsperioder
        LagringTrigger->>FormUtils: HarBrukerendringer? Ja
        LagringTrigger->>RHF_FormUI: trigger(validering medlemskap)
        RHF_FormUI-->>LagringTrigger: Gyldig? Ja
        LagringTrigger->>ValideringUtils: Sjekk Gap/Overlapp? OK
        LagringTrigger->>LagringTrigger: Kaller debounced Lagre Medlemskap(...)
        Note right of LagringTrigger: Debounce Lagring venter...
        LagringTrigger->>MedlemskapApi: lagreMedlemskapsperioder(...)
        MedlemskapApi->>Backend: PUT/POST P'
        Backend-->>MedlemskapApi: OppdatertePerioder
        MedlemskapApi-->>LagringTrigger: Promise resolves(OppdatertePerioder)
        LagringTrigger->>FormHook: SET FormHook.lagredeMedlemskapsperioder
        LagringTrigger->>RHF_FormUI: RHF.setValue("medlemskapsperioder")

        Note over RHF_FormUI, BeregningTrigger: RHF state endring (setValue) triggrer BeregningTrigger

        RHF_FormUI->>BeregningTrigger: useEffect reagerer (RHF.medlemskapsperioder endret)
        BeregningTrigger->>RHF_FormUI: trigger(validering hele skjema)
        RHF_FormUI-->>BeregningTrigger: Gyldig? Ja
        BeregningTrigger->>DebouncedBeregning: Kaller debounced Beregn(...)
        Note right of DebouncedBeregning: Debounce Beregning venter...
        DebouncedBeregning->>Backend: POST /beregn-avgift (med oppdaterte RHF.perioder)
        Backend-->>DebouncedBeregning: BeregnetAvgift
        DebouncedBeregning-->>BeregningTrigger: Promise resolves(BeregnetAvgift)
        BeregningTrigger->>RHF_FormUI: RHF.setValue("totalAvgift")

    else Endring i Skatteforhold/Inntekt Periode S' (Krever kun beregning)
        Bruker->>RHF_FormUI: Endrer Skatteforhold/Inntekt Periode S'
        RHF_FormUI->>BeregningTrigger: useEffect reagerer (RHF.skatteforhold/inntekt endret)
        BeregningTrigger->>RHF_FormUI: trigger(validering hele skjema)
        RHF_FormUI-->>BeregningTrigger: Gyldig? Ja
        BeregningTrigger->>DebouncedBeregning: Kaller debounced Beregn(...)
         Note right of DebouncedBeregning: Debounce Beregning venter...
        DebouncedBeregning->>Backend: POST /beregn-avgift (med oppdaterte RHF.perioder)
        Backend-->>DebouncedBeregning: BeregnetAvgift
        DebouncedBeregning-->>BeregningTrigger: Promise resolves(BeregnetAvgift)
        BeregningTrigger->>RHF_FormUI: RHF.setValue("totalAvgift")
    end

```

*(Detaljerte sekvensdiagrammer for redigering/legg til og sletting av *medlemskap* beholdes som før)*

## Konsekvenser

*(Uendret fra forrige versjon)* 