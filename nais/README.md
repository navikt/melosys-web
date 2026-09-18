# Deploy til nais
Frontend deployes som en Node/Express-container. Proxying til Melosys-API og
øvrige backends, samt runtime-konfigurasjon til frontend-appen, er
implementert i `server/`-koden og styres via miljøvariabler satt i `nais.yaml`
(fylt ut fra `vars-*.json`).

## Automatisk deploy
Melosys-web deployer automatisk til dev ved push på `master`-branch

## Manuell deploy
For manuell deploy, så kan man gå til https://github.com/navikt/melosys-web/actions/, velge deploy-workflow og trykke "run workflow".

Alternativt kan man finne ønsket docker-image fra docker-repoet til melosys-web på github.
Dette limer man inn i feltet `spec.image` i nais.yaml.
Husk også å bytte ut variabler som `INGRESSES` og `APP_NAME` med faktiske verdier. Verdiene for de ulike miljøene kan finnes i vars-dev.json, vars-prod.json osv.

Sett ønsket cluster med `kubectl config use-context dev-fss`.

Etter nais.yaml er konfigurert kjører man videre kommandoen `kubectl apply -f nais.yaml`.
Melosys-web blir nå deployet til ønsket cluster og namespace i nais.
