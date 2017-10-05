# Melosys
Dette er prosjektet for Melosys

## Plattform
Prosjektet bygger på React og Redux.

## Struktur
Nedenfor er en beskrivelse av komponent- og containerstruktur i prosjektet.
Oversikten er ikke uttømmende, men er ment å gi en idé om den overordnede arkitekturen
for prosjektet.

### Containere (./containers)

| Navn             | Beskrivelse      |
| ---------------- | ---------------- |
| Rammeverk | Dette er rammeverket for applikasjonen og trekker inn Topplinje-container etc. |

### Komponenter (./components)

| Navn             | Beskrivelse      |
| ---------------- | ---------------- |
| Topplinje | Dette er containeren som inneholder logo etc. |

## Routes
Følgende routes er satt opp i applikasjonen:

| Route            | Container        | Beskrivelse      |
| ---------------- | ---------------- | ---------------- |
| /sok | Sok | Dette er grunnrouten som saksbehandleren benytter for å hente søke etter en sak eller hente tidligere behandlede saker. |
