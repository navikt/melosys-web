


## Generering av graphQL-kode

Prosjektet er satt opp til å kunne generere graphQL-relatert kode og interfaces/types automatisk.

<br/>

### For å generere graphQL-kode:
1.  Lag en .gql-fil med den [operation](https://graphql.org/learn/queries/#operation-name) (query/mutation) du ønsker å bruke. Se [hentStatsborgerskap.gql](src/felleskomponenter/menypanel/menypunkter/person/statsborgerskapTable/hentStatsborgerskap.gql) for eksempel på et query.
2.  Kjør opp melosys-api lokalt ved hjelp av [melosys-docker-compose](https://github.com/navikt/melosys-docker-compose/) og autentiser generatoren (se [autentisering](#autentisering-mot-melosys-api)).
3.  Kjør `pnpm run generate-graphql`.

Genererte filer skal aldri redigeres manuelt. Endre `.gql`-filene eller generatoroppsettet og kjør generatoren på nytt.

<br/>

### Hva genereres:

* Typede GraphQL-dokumenter og operation-typer

  * Genereres der hvor [operations](https://graphql.org/learn/queries/#operation-name) (.gql-filer) ligger.
  * Bruk dokumentene med `useQuery` fra `@apollo/client/react` eller `apolloClient.query`. Apollo utleder data- og variabeltypene fra dokumentet.
  * `typescript-react-apollo` brukes ikke, siden de genererte hookene ikke er kompatible med Apollo Client 4.

* En SDK som tilbyr alle operations innenfor src/graphql, til bruk utenfor react-komponenter

  * Genereres i `src/graphql` og må importeres herfra til dit den skal brukes

<br/>

### Autentisering mot melosys-api:
Ved generering av kode forventes det at [melosys-api](https://github.com/navikt/melosys-api/) kjører på localhost:8080, slik at kodegeneratoren kan få tak i graphQL-skjemaet til melosys-api.

Sett `GRAPHQL_TOKEN` i prosessmiljøet for å autentisere med et lokalt bearer-token. Tokenet skal ikke lagres i kildekoden eller committes.

Alternativt kan en innloggingscookie hentes fra en request i nettleserens devtools og brukes midlertidig i `codegen.yml`. Fjern cookien før commit.

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
