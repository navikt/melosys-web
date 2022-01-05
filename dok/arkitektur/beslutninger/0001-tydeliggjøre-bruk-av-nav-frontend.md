# 1. Tydeliggjøre bruk av nav-frontend

Dato: 2018

## Status

Akseptert

## Kontekst

Melosys bruker både komponenter fra nav-frontend og egendefinerte komponenter. Navnene på komponentene i nav-frontend er ofte generiske, for eksempel er det en komponent som heter "Knapp". Vi trenger en måte å raskt kunne se i koden om en komponent er egendefinert eller kommer fra nav-frontend.

## Beslutning

Vi beslutter å bruke stjerneimport for å signalisere at komponenter kommer fra nav-frontend. Vi gjør det slik:
```
import * as Nav from "./navFrontend";

const Komponent = () => <Nav.Knapp />;
```

## Konsekvenser

Det vil være tydelig at komponenter kommer fra nav-frontend der de blir brukt.
