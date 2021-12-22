# 2. Typescript

Dato: Sommeren 2020

## Status

Akseptert

## Kontekst

Kodebasen er opprinnelig skrevet i javascript, et språk som mangler "type-safety" og dermed er vanskelig å jobbe med i store kodebaser. Vi har behov for å kunne refaktorere koden med større sikkerhet for at vi ikke introduserer feil en det javascript tilbyr.

Vi ser også at typescript er mye brukt i nav.

## Beslutning

Vi beslutter å utvikle all ny funksjonalitet i typescript, og å endre eksisterende kode til typescript ved refaktoreringer, gitt at det kan gjøres innenfor en realistisk tid.

## Konsekvenser

Kodebasen vil over tid inneholde mer og mer typescript, ettersom ny funksjonalitet blir utviklet og eldre kode blir refaktorert. Det vil bli enklere å refaktorere koden, siden type-feil vil plukkes opp ved bygg av koden.
