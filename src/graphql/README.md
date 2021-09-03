


## Generering av graphQL-kode

Prosjektet er satt opp til å kunne generere graphQL-relatert kode og interfaces/types automatisk.

<br/>

### For å generere graphQL-kode:
1.  Lag en .gql-fil med den [operation](https://graphql.org/learn/queries/#operation-name) (query/mutation) du ønsker å bruke. Se [hentStatsborgerskap.gql](../felleskomponenter/menypanel/menypunkter/person/statsborgerskapsliste/hentStatsborgerskap.gql) for eksempel på et query.
2.  Kjør opp melosys lokalt ved hjelp av [melosys-docker-compose](https://github.com/navikt/melosys-docker-compose/), logg inn og hent cookie fra en request. Lim cookie inn i codegen.yml.
3.  Kjør `npm run generate-graphql`

<br/>

### Hva genereres:

* React hooks

  * Genereres der hvor [operations](https://graphql.org/learn/queries/#operation-name) (.gql-filer) ligger.

* En SDK som tilbyr alle operations innenfor src/graphql, til bruk utenfor react-komponenter

  * Genereres i `src/graphql` og må importeres herfra til dit den skal brukes

<br/>

### Autentisering mot melosys-api:
Ved generering av kode forventes det at [melosys-api](https://github.com/navikt/melosys-api/) kjører på localhost:8080, slik at kodegeneratoren kan få tak i graphQL-skjemaet til melosys-api.

For øyeblikket er det nødvendig å oppgi en cookie for å autentisere kodegeneratoren mot melosys-api. Denne cookien kan hentes ved å kjøre opp melosys lokalt med melosys-docker-compose, logge inn i melosys og kopiere fra en request(i nettleserens devtools).

Cookien limes inn i `codegen.yml` slik:

```

schema:

  - http://localhost:8080/graphql:

      headers:

        Cookie: "lim inn cookie her"

```

<br/>

### Lokalt graphQL-skjema
Det er også mulig å endre `schema`-feltet til å peke på et lokalt graphQL-skjema, se [dokumentasjon](https://www.graphql-code-generator.com/docs/getting-started/schema-field) for GraphQL Code Generator.
