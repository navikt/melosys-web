# 7. Tekstblokker og brevmaler – frontend-arkitektur

Dato: 2026-05-22

## Status

Akseptert

## Kontekst

Saksbehandlere har behov for å gjenbruke standardparagrafer og komplette brev i Send
brev-flyten. Backend-siden (REST-API + DB) er besluttet i melosys-api ADR 0001. Denne
ADR-en handler om hvordan featuren eksponeres i frontend:

- Søk og innsetting i selve Send brev-popoveren
- Egen admin-side for å opprette, redigere og slette
- Begge bak en feature toggle slik at vi kan rulle ut til et utvalg saksbehandlere først

## Beslutning

### Splittet ansvar mellom popover og admin-side
- **Send brev-popoveren** (`src/felleskomponenter/htmlEditor/tekstblokkSoek.tsx`)
  er **kun lese/søk**. Den lar saksbehandleren finne og sette inn — ingen redigering,
  ingen sletting, ingen "Lag ny"-knapp.
- **Admin-siden** (`src/sider/administrasjon/tekstblokker/`) er der opprett, rediger
  og slett skjer. Dette skiller hverdagsbruk (innsetting) fra forvaltning, og holder
  popoveren fokusert.

### Komponentsplitt
Admin-siden er delt i fokuserte komponenter, hver med ett ansvar:
```
tekstblokkerSide.tsx        // orchestrator: state + tabs-overgang + modal-styring
tekstblokkerFilter.tsx      // Tabs + Search + Chips-tag-filter
tekstblokkerListe.tsx       // Aksel Table med tittel, tags, sist endret, knapper
tekstblokkRedigeringModal.tsx // Aksel Modal m/ HtmlEditor + tittel + tags
tekstblokkSlettBekreftelse.tsx // Aksel Modal-bekreftelse
tagInput.tsx                // Chips.Removable + TextField for å bygge tag-liste
tekstblokkerUtils.ts        // matcherSoek, tellTags, filtrer
```
Dette gjør at en utvikler kan endre filteret uten å lese listen, og motsatt.

### Aksel-komponenter overalt
Vi bruker `@navikt/ds-react` direkte (`Popover`, `Tabs`, `Chips`, `Search`, `Modal`,
`Table`, `Tag`, `BodyShort`, `Loader`, `Button`, `Alert`, `Label`, `TextField`),
ikke egendefinerte wrappere. `src/navFrontend/` brukes kun der det allerede er
konsistent stil-konvensjon i resten av siden. Direkte bruk gir best tilgang til
Aksel-API-et og tydeliggjør hvor designsystemet stopper og vår kode begynner.

### Feature toggle – defence in depth
`melosys.tekstblokker` styrer:
1. **Lenken i toppmenyen** — `useFeatureToggle` i `topplinje.jsx`
2. **Admin-siden** — egen `TekstblokkerRute`-wrapper i `routing.jsx` viser `UkjentSide`
   hvis toggle er av
3. **Popoveren i Send brev** — `tekstblokkSoek` returnerer `null` hvis toggle er av
4. **API-et** — backend returnerer 403 (melosys-api ADR 0001)

Hvert lag gater uavhengig, så ingen ende kan eksponere featuren utilsiktet.

### Client-side søk på lett liste-DTO
Med ~210 forventede oppføringer henter vi hele lista én gang (~30–60 KB) og søker i
memory. Backend støtter `?type=` for å redusere payload til kun den aktive fanen.
Full HTML hentes lazy med `useTekstblokk(id)` ved "Vis hele" eller før innsetting.
Se [ADR 0006](./0006-tanstack-query.md) for det generelle data-fetching-mønsteret.

### Quill-editor gjenbrukt fra Send brev
Redigeringsmodalen bruker samme `HtmlEditor` som Send brev. Det sikrer at det som
saksbehandleren ser i editoren er det som vises etter innsetting — inkludert
[PLACEHOLDER]-markering, tabeller, headings og lister. Backend saniterer mot samme
safelist som Quill produserer.

## Konsekvenser

**Positive**
- Tydelig skille mellom hverdagsbruk og forvaltning
- Små, lesbare komponenter — enklere å endre/teste isolert
- Aksel-stilen er konsistent uten vedlikehold av egne wrappere
- Trygg utrulling via flerlags-toggle

**Avveininger**
- Mange små filer; krever litt navigering for utviklere som er vant til monolitter
- Memoryselect-søk skalerer ikke utover noen tusen oppføringer — vi har en åpning
  for `?sok=`-endepunkt hvis behovet kommer
- Quill-baserte redigeringsmodaler kan bli store; vi har lagt min-høyde 16rem og
  Modal-bredde `medium`, som passer brevmaler men kanskje må justeres senere

## Filer

- Popover i Send brev: `src/felleskomponenter/htmlEditor/tekstblokkSoek.{tsx,less}`
- Editor-integrasjon: `src/felleskomponenter/htmlEditor/htmlEditor.tsx`
- Admin-side: `src/sider/administrasjon/tekstblokker/`
- API-klient: `src/services/api/tekstblokker.ts`, `src/services/modules/tekstblokker.ts`
- Routing/toppmeny: `src/routing.jsx`, `src/sider/rammeverk/komponenter/topplinje.jsx`
- Feature toggle: `src/featuretoggle/toggleNavn.ts`
