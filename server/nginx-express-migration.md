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
| `location /melosys/` (`root` + `try_files $uri /index.html`) | `router.use("/melosys", ...)` | SPA-fallback: prøver filoppslag relativt til `staticDir`, med full original URI (inkl. `/melosys`-prefikset) som sti, faller så tilbake til `index.html`. I praksis finnes det ingen fysisk `melosys/`-mappe i build-outputen, så dette faller alltid tilbake til `index.html` — akkurat som før. Filoppslaget bruker `sendFile`s `root`-opsjon, som normaliserer stien og avviser forsøk på å bryte ut av `staticDir` (f.eks. via `..` i stien). `Cache-Control: no-store, no-cache` + `Expires: 0` settes på svaret. Dette er en endring fra nginx: selv om den gamle nginx-konfigurasjonen inneholdt de samme `add_header`-direktivene for denne locationen, viste empirisk testing mot en kjørende nginx-instans at SPA-fallback-svaret ikke fikk noen `Cache-Control`-header i praksis. Den nye, mer korrekte oppførselen er beholdt. |

**Avvik fra nginx-oppsettet (statisk hosting):**

- `favicon.ico`, `manifest.json` og `index.html` direkte på rot (`/`) ga
  `200` med nginx. Nå gir de `404`, siden `/` kun håndterer redirect til
  `/melosys/` og ingen statiske filer serveres utenfor `/melosys`-prefikset.
  Ikke fikset: appen er fullt namespacet under `/melosys/`, og det er ingen
  kjent bruk av disse stiene på rot.
- `POST` mot `/melosys/*` ga `405` med nginx. Nå gir det `200` med
  `index.html` (samme SPA-fallback som `GET`). Ikke fikset: dette er en
  lesetilgang til statisk innhold uten sideeffekter, så risikoen vurderes
  som lav.

## API-proxying (`apiProxy.ts`)

Samme rutetabell som `proxy_pass`-reglene i `default.conf`, med ett unntak
(se avvik under):

| Path-prefiks | Proxy-mål |
|---|---|
| `/api/` | `${APP_URL_MELOSYS}/api/` |
| `/trygdeavtale-flyt/` | `${APP_URL_TRYGDEAVTALE}/flyt/` |
| `/faktureringskomponenten/` | `${APP_URL_FAKTURERINGSKOMPONENTEN}/` |
| `/graphql/` | `${APP_URL_MELOSYS}/graphql/` |

**Avvik fra nginx-oppsettet:** `/melosys/api/` (som pekte på samme mål som
`/api/`) er bevisst **ikke** videreført som proxy. Verifisert ved søk i
`src/` at React-appen kun bruker `/api/` (via `API_BASE_URL` i
`src/services/api-constants.js`, satt til `"/api/"` i `config.ts`) — ingen
kode i frontend refererer til `/melosys/api/`. Git-historikk viser at
mønsteret stammer fra en gammel mock-server-oppsett fra lenge før
nginx-migreringen, og har blitt kopiert videre gjennom hvert
serveroppsett siden uten at behovet er bekreftet. I stedet for å la kall
mot `/melosys/api/*` falle gjennom til SPA-fallbacken (som ville gitt
`200` + `index.html`, og dermed skjule feilen for en eventuell bruker av
den gamle stien), svarer `apiProxy.ts` eksplisitt `404` på denne stien.

nginx satte `X-Forwarded-Host`/`X-Forwarded-Server`/`X-Forwarded-For` på
proxy-requestene. `http-proxy-middleware`s `xfwd: true`-opsjon gir samme
headere videre til upstream.

**Tidsavbrudd, feilhåndtering og body-størrelse:** Alle proxy-rutene har
`proxyTimeout`/`timeout` satt til 60 sekunder (nginx sin
`proxy_read_timeout`/`proxy_connect_timeout` var også i denne
størrelsesordenen) — uten dette ville en hengende backend kunne binde opp
tilkoblinger/minne på ubestemt tid. En egen `on.error`-handler svarer `502`
uten å eksponere backend-adressen i responsen (standardoppførselen til
`http-proxy-middleware` inkluderer target-URL-en i feilmeldingen, som ikke
bør nå klienten). En egen body-størrelsesgrense på 1 MB (tilsvarer nginx
sin standard `client_max_body_size`) gir `413` for for store requests i
stedet for å videresende dem uansett størrelse.

Én gjenstående, lavrisiko-forskjell fra nginx (ikke fikset, e2e-testene er
grønne så det er trolig ufarlig i dag): `/graphql/` sendes videre som
`/graphql` (uten avsluttende skråstrek), og `%2F`/`//` i stien
videresendes uendret i stedet for å normaliseres først slik nginx gjorde.

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

`AZURE_APP_TENANT_ID` settes bevisst **ikke** eksplisitt i `nais.yaml`
lenger: NAIS setter selv denne miljøvariabelen på podden via
Azure AD-integrasjonen (`spec.azure.application.enabled: true`). Å sette
den på nytt her ville stille og uten videre latt vår verdi overstyre
NAIS sin, med risiko for at de to kunne divergere ubemerket. `config.ts`
leser fortsatt `AZURE_APP_TENANT_ID` fra miljøet — i NAIS-miljøer kommer
den nå fra NAIS sin auto-injeksjon, mens den fortsatt settes eksplisitt
i `melosys-docker-compose`/`melosys-e2e-tests` (som ikke har noen
tilsvarende NAIS-integrasjon).

## Health-endepunkter (`actuators.ts`)

Nye, eksplisitte endepunkter: `/internal/health/liveness` og
`/internal/health/readiness`. Disse fantes ikke som egne endepunkter i det
gamle oppsettet (nginx sin SPA-fallback svarte `200` på alt under
`/melosys/`, inkludert de gamle helsesjekk-stiene), men gir nå et billigere
og mer presist helsesjekk-svar for NAIS. De er registrert før
logging-middlewaren, slik at gjentagende liveness-/readiness-kall (flere
ganger i minuttet, per pod) ikke havner i loggen.

## Driftsegenskaper (`index.ts`, `server.ts`)

- **Keep-alive.** Node sin standard `keepAliveTimeout` (5 sekunder) er
  kortere enn det en ingress typisk forventer, og kunne gi sporadiske
  `502`-er hvis ingress prøvde å gjenbruke en forbindelse Node nettopp
  hadde lukket. Satt til 65 sekunder (`headersTimeout` til 66 sekunder),
  tilsvarende nginx sin `keepalive_timeout`.
- **Graceful shutdown.** Serveren håndterer nå `SIGTERM` ved å slutte å ta
  imot nye tilkoblinger og fullføre pågående requests før prosessen
  avsluttes, i stedet for å kutte dem brått slik Node ellers ville gjort
  ved `docker stop`/pod-terminering ved deploy.
- **`X-Powered-By`.** Express sin standardheader som avslører hvilket
  rammeverk serveren kjører på er skrudd av (`app.disable("x-powered-by")`).
