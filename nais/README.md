# Deploy til Nais

Vi deployer frontenden i et minimalt nginx-image fra Chainguard. Imaget inneholder bare det ferdige Vite-bygget og har verken shell eller eget oppstartsskript.

## Runtime-konfigurasjon

`runtime-config.yaml` oppretter en miljøspesifikk ConfigMap med:

- `default.conf`, som definerer nginx-ruter og proxyer
- `env-config.js`, som gjør offentlig frontend-konfigurasjon tilgjengelig for nettleseren

`nais.yaml` monterer ConfigMap-en i `/etc/nginx/conf.d`. Nginx leser den ferdige konfigurasjonen når containeren starter. Vi kan bruke det samme imaget i q1, q2 og produksjon; verdiene kommer fra den valgte `vars-*.json`-filen ved deploy.

Du må deploye ConfigMap-en og Application-ressursen sammen:

```text
RESOURCE=nais/runtime-config.yaml,nais/nais.yaml
```

Alle verdiene i `env-config.js` er tilgjengelige i nettleseren. Filen må derfor ikke inneholde tokens eller andre hemmelige verdier.

Kjør containerens røyktest lokalt etter `pnpm build`:

```bash
pnpm test:container
```

## Automatisk deploy

Melosys-web deployer automatisk til dev ved push på `master`-branch.

## Manuell deploy

Gå til [GitHub Actions](https://github.com/navikt/melosys-web/actions/), velg deploy-workflowen og trykk på «Run workflow».

Alternativt kan man finne ønsket docker-image fra docker-repoet til melosys-web på github.
Dette limer man inn i feltet `spec.image` i nais.yaml.
Husk også å bytte ut variabler som `INGRESSES` og `APP_NAME` med faktiske verdier. Verdiene for de ulike miljøene kan finnes i vars-dev.json, vars-prod.json osv.

Sett ønsket cluster med `kubectl config use-context dev-fss`.

Når du har rendret manifestene med riktige miljøverdier, deployer du både `runtime-config.yaml` og `nais.yaml`.
Melosys-web blir nå deployet til ønsket cluster og namespace i nais.
