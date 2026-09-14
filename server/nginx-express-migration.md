# Migrering fra nginx til Node/Express

Denne serveren erstatter nginx for statisk hosting, kjøretidskonfigurasjon og
API-proxying av melosys-web (MELOSYS-8280). Målet for første iterasjon var
1:1-parity med det gamle nginx-oppsettet (ingen atferdsendringer). Dette
dokumentet oppsummerer hvordan hver del av det gamle nginx-oppsettet er
gjenskapt i `server/src/`.

## Oversikt over hvor den gamle nginx-konfigurasjonen lå

- `nais/runtime-config.yaml` (slettet) — ConfigMap-mal for `default.conf` +
  `env-config.js` i prod/dev.
- `melosys-docker-compose/melosys-web/default.conf` + `env-config.js` —
  brukt lokalt via docker-compose.
- `melosys-e2e-tests/melosys-web/default.conf` + `env-config.js` — brukt av
  e2e-test-miljøet.

Alle tre var funksjonelt like (samme routing/proxy-regler), med ulike
miljøvariabel-verdier injisert i `env-config.js`.

## Ruting og statisk hosting (`staticRoutes.ts`)

| Gammel nginx `location` | Ny Express-rute | Oppførsel |
|---|---|---|
| `location = /` | `GET /` | 301-redirect til `/melosys/` |
| `location /melosys/assets/` (alias, uten `try_files`) | `router.use("/melosys/assets", ...)` | Serverer statiske filer fra bygget frontend. Manglende fil gir **404** direkte (ingen SPA-fallback) |
| `location /melosys/` (`root` + `try_files $uri /index.html`) | `router.use("/melosys", ...)` | SPA-fallback: prøver filoppslag på `staticDir` + full original URI (inkl. `/melosys`-prefikset, akkurat som nginx sin `root`-variant uten `alias` gjorde), faller så tilbake til `index.html`. I praksis finnes det ingen fysisk `melosys/`-mappe i build-outputen, så dette faller alltid tilbake til `index.html` — akkurat som før. `Cache-Control: no-store, no-cache` + `Expires: 0` settes på svaret, som replikerer nginx sine no-cache-headere for SPA-fallbacken. |

## API-proxying (`apiProxy.ts`)

Samme rutetabell som `proxy_pass`-reglene i `default.conf`:

| Path-prefiks | Proxy-mål |
|---|---|
| `/api/` | `${APP_URL_MELOSYS}/api/` |
| `/melosys/api/` | `${APP_URL_MELOSYS}/api/` |
| `/trygdeavtale-flyt/` | `${APP_URL_TRYGDEAVTALE}/flyt/` |
| `/faktureringskomponenten/` | `${APP_URL_FAKTURERINGSKOMPONENTEN}/` |
| `/graphql/` | `${APP_URL_MELOSYS}/graphql/` |

nginx satte `X-Forwarded-Host`/`X-Forwarded-Server`/`X-Forwarded-For` på
proxy-requestene. `http-proxy-middleware`s `xfwd: true`-opsjon gir samme
headere videre til upstream.

Én forskjell fra nginx: nginx slo opp DNS for alle upstreams én gang ved
oppstart og kunne dø permanent hvis én manglet i docker-DNS ved
containerstart (derfor måtte alle avhengigheter stå i `depends_on` +
`restart: on-failure` i docker-compose-oppsettene). Express/
`http-proxy-middleware` gjør oppslag per request, så dette race-problemet
finnes ikke lenger.

## Runtime-konfigurasjon (`envConfigRoute.ts` + `config.ts`)

`/env-config.js` og `/melosys/env-config.js` genereres fra miljøvariabler
(samme felter som lå i den gamle `env-config.js`), med samme
`Cache-Control: no-store, no-cache` + `Expires: 0`-headere som før, slik at
nettleseren aldri cacher denne filen.

`LOCAL_AUTH_TOKEN` er kun satt lokalt/i e2e (ikke i prod/dev-vars) for å
bypasse ekte innlogging — utelates fra `env-config.js` automatisk når
miljøvariabelen ikke er satt.

## Health-endepunkter (`actuators.ts`)

Nye, eksplisitte endepunkter: `/internal/health/liveness` og
`/internal/health/readiness`. Disse fantes ikke som egne endepunkter i det
gamle oppsettet (nginx sin SPA-fallback svarte `200` på alt under
`/melosys/`, inkludert de gamle helsesjekk-stiene), men gir nå et billigere
og mer presist helsesjekk-svar for NAIS.
