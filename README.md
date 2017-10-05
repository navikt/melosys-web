# Melosys
Dette er prosjektet for Melosys - Medlems og Lovvalgssystem.

## Plattform
Frontend bygger på React og Redux. For detaljer og dokumentasjon, se intern Confluence.

## Struktur
Nedenfor er en beskrivelse av komponent- og containerstruktur i prosjektet.
Oversikten er ikke uttømmende, men er ment å gi en idé om den overordnede
arkitekturen for prosjektet.

### Sider (./sider)
Dette er selvstående skjermbilder / sider som refereres til gjennom
individuelle routes. Sider kan normalt ikke kombineres eller nøstes, men
er individuelle og tar hele nettleser-flaten.

| Navn             | Beskrivelse      |
| ---------------- | ---------------- |
| Rammeverk | Dette er rammeverket for applikasjonen og trekker inn Topplinje-container etc. |
| Sok | Dette er skjermbildet hvor saksbehandleren enten gjør et søk eller henter frem tidligere behandlede saker. |

### Felles komponenter (./felles-komponenter)
Dette er komponenter (stateful eller pure/stateless) som gjenbrukes i diverse
sider. Komponenter kan også nøste hverandre.

| Navn             | Beskrivelse      |
| ---------------- | ---------------- |
| Topplinje | Dette er containeren som inneholder logo, søk, saksbehandlernavn etc. |

## Routes
Applikasjonen har ingen omfattende navigasjon, og hele saksbehandlingen
foregår på én side. Følgende routes er satt opp i applikasjonen:

| Route            | Container        | Beskrivelse      |
| ---------------- | ---------------- | ---------------- |
| /sok | Sok | Dette er grunnsiden som saksbehandleren benytter for å hente søke etter en sak eller hente tidligere behandlede saker. |
| /saksbehandling | Saksbehandling | Dette er hovedsiden i applikasjonen hvor alle nødvendige felles-komponenter er bygget inn. |
