# Deploy til nais
Frontend deployes i en nginx-container som tar seg av oidc-oppsett. I `proxy.nginx`
defineres proxy til melosys backend.

## Automtatisk deploy
Melosys-web deployer automatisk til t8 ved push på `SPRINT-*`-branch
(TODO: utfyll etter flere miljøer legges til)

## Manuell deploy
For manuell deploy, så kan man finne ønsket docker-image fra docker-repoet til melosys-web på github.
Dette limer man inn i feltet `spec.image` i app.yaml.
Husk også å endre `ingress`, `namespace` og `REDIS_HOST`.

Sett ønsket cluster med `kubectl config use-context dev-fss`.

Etter app.yaml er konfigurert kjører man videre kommandoen `kubectl apply -f app.yaml`. 
Melosys-web blir nå deployet til ønsket cluster og namespace i nais.

Det er viktig at følgende ENV-variabler er satt i vault for å kunne rulle ut til et miljø.
```$bash
OIDC_AGENTNAME
OIDC_HOST_URL
OIDC_PASSWORD
```
