
## Generering av graphQL-kode

Prosjektet er satt opp til å kunne generere graphQL-relatert
kode og interfaces/types automatisk.

For øyeblikket genereres:
* React hooks
  * Genereres der hvor [operations](https://graphql.org/learn/queries/#operation-name) (.gql-filer) ligger. Se [hentStatsborgerskap.gql](../felleskomponenter/menypanel/menypunkter/person/statsborgerskapsliste/hentStatsborgerskap.gql) for eksempel på en query-operation.
* En SDK som tilbyr alle operations innenfor src/graphql, til bruk utenfor react-komponenter
  * Genereres i `src/graphql` og må importeres herfra til dit den skal brukes

Ved generering av kode forventes det at [melosys-api](https://github.com/navikt/melosys-api/) kjører på
localhost:8080, slik at kodegeneratoren kan få tak i graphQL-skjemaet
til melosys. For øyeblikket er det nødvendig å oppgi en cookie for å autentisere
kodegeneratoren mot melosys-api. Denne cookien kan hentes ved å kjøre opp frontend,
logge inn i melosys og kopiere fra en request(i chrome devtools).
Cookien limes inn i `codegen.yml` slik:
```
schema:
  - http://localhost:8080/graphql:
      headers:
        Cookie: "lim inn cookie her"
```

Det er også mulig å endre `schema`-feltet til å peke på et lokalt graphQL-skjema,
se [dokumentasjon for kodegenerator](https://www.graphql-code-generator.com/docs/getting-started/schema-field).

Kommando for å generere kode er:
```
npm run generate-graphql
```
