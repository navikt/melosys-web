# 2. Opprette egen nais-app

Dato: Sommeren 2019

## Status

Akseptert

## Kontekst

Prosjektet blir for øyeblikket publisert til et registry og hentet inn i melosys-api som en mvn-pakke. Dette betyr at dersom man vil deploye prosjektet, er man nødt til å "bumpe" prosjektets versjon i melosys-api og deploye melosys-api.

## Beslutning

Vi beslutter å opprette en egen app på nais for prosjektet, kalt melosys-web.
Vi tar i bruk https://github.com/navikt/nginx-oidc-docker for å håndtere autentisering, som ble håndtert gjennom melosys-api før.

## Konsekvenser

Prosjektet kan deployes uavhengig av melosys-api, og man kan sette ulike nais-innstillinger uten å påvirke melosys-api.
