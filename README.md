# Melosys
Dette er repo for Melosys (Medlems- og Lovvalgssystem) som er en del av EESSA2-arbeidet til Nav. For mer informasjon om prosjektet på et overordnet plan, se intern Confluence.

## Plattform og avhengighet
Løsningen bygger på React 16, samt NAVs egne `nav-frontent-` for frontentkomponenter i tillegg til en rekke andre komponenter, blant annet `autoless` for pre-transpiling av less til css før react-scripts overtar build.

For mer informasjon om komponenter, se `package.json`. 

## Dokumentasjon

### Mock-server
Alle navn og opplysninger er syntetisk generert data og har ingen sammenheng med reelle personer, saker eller søknader.


### Routes
Rotmappen for prosjektet i dev-mode er '/melosys/'. Dette kan endre seg etterhvert som prosjektet nærmer seg en beta-fase.

| Navn | Rot-container | Kommentar |
| ---- | ----------- | --------- |
| /login/ | login.js (`Sok`) | Dette er en selvstendig view container for login. I utgangspunktet tilbyr systemet single-signon. |
| /sok/ | sok.js (`Sok`) | Dette er en selvstendig view container for søkefunksjonalitet |
| /saksbehandling/ | saksbehandling.js (`Saksbehandling`) | Dette er en selvstendig view container for saksbehandling (enkeltsaker) |

### Struktur, komponenter og containere
Definisjon:
* _Containers:_ UI-elementer som i større grad kan sees som individuelle og som igjen inneholder komponenter. Trenger ikke være fullstendige views. Containere kan nøste andre containere.
* _Components:_ UI-elementer (knapper, nedtrekk, tekstfelt, paneler etc) som ikke kan stå alene, men er avhengig av en forelder.

Oversikten nedenfor er muligens ikke uttømmende, men er ment å gi en innføring i komponentene.

#### Containere
| Navn | Beskrivelse |
| ---- | ----------- |
| App     | Grunn-containeren for løsningen. |
| Rammeverk     | Dette er rammeverket for hele løsningen som trekker inn Topplinje og andre components som er ment å være globale for hele systemet. |
| Sok     | Dette er start-skjermen som saksbehandleren benytter for å søke eller enkelt finne tilbake til tidligere saker, enten de er pågående eller ferdig behandlet. |
| Saksbehandling     | Dette kan sees som 'hovedskjermbildet' i løsningen hvor hele saksbehandlingen, inkludert vurderinger og gjennomsyn av søknaden foregår. Igjennom hele prosessen vil saksbehandleren navigere seg innenfor denne containeren. |

#### Components
| Navn | Beskrivelse |
| ---- | ----------- |
| Topplinje  | Inneholder topplinje med logo, systemnavn, søkeboks og navn på innlogget bruker mm.  |