# 4. graphql-code-generator

Dato: 2021-08-01

## Status

Akseptert

## Kontekst

I forbindelse med bruk av PDL har teamet besluttet å servere data fra saksopplysninger gjennom et graphql-api. Siden dette prosjektet bruker typescript, hadde det tatt en del tid å skrive typer for dataene som kan bli mottatt fra dette apiet.

## Beslutning

Vi beslutter å bruke graphl-code-generator for å generere typer fra graphql-skjemaet til melosys-api.
Hva som genereres er beskrevet i mer detalj i [dokumentasjonen for graphql-kodegenerering](../../../src/graphql/README.md).

## Konsekvenser

Utviklere som jobber med graphql i prosjektet blir nødt til å kjøre kodegenereringen hvis det er endringer i graphql-apiet. Dette krever at man kjører opp melosys-api eller melosys-web-mock for å få tak i graphql-schemaet.
