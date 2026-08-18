# Deploy til nais
Frontend deployes i en nginx-container (Chainguard). Imaget inneholder kun det ferdige bygget og har verken shell eller oppstartsskript.
`runtime-config.yaml` lager en ConfigMap med `default.conf` (proxy til Melosys-API) og `env-config.js` (frontend-konfig),
som `nais.yaml` monterer i `/etc/nginx/conf.d`. Verdiene fylles inn fra `vars-*.json` ved deploy.
ConfigMap-en må derfor deployes sammen med applikasjonen: `RESOURCE=nais/runtime-config.yaml,nais/nais.yaml`.

## Automatisk deploy
Melosys-web deployer automatisk til dev ved push på `master`-branch

## Manuell deploy
For manuell deploy, så kan man gå til https://github.com/navikt/melosys-web/actions/, velge deploy-workflow og trykke "run workflow".

Alternativt kan man finne ønsket docker-image fra docker-repoet til melosys-web på github.
Dette limer man inn i feltet `spec.image` i nais.yaml.
Husk også å bytte ut variabler som `INGRESSES` og `APP_NAME` med faktiske verdier. Verdiene for de ulike miljøene kan finnes i vars-dev.json, vars-prod.json osv.

Sett ønsket cluster med `kubectl config use-context dev-fss`.

Etter app.yaml er konfigurert kjører man videre kommandoen `kubectl apply -f runtime-config.yaml -f nais.yaml`.
Melosys-web blir nå deployet til ønsket cluster og namespace i nais.
