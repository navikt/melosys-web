# 8. Erstatte nginx med Node/Express-server

Dato: 2026-10-06

## Status

Akseptert

## Kontekst

melosys-web brukte nginx til å servere den bygde frontend-appen, levere
runtime-konfigurasjon og proxy'e API-kall. Nginx-konfigurasjonen var fordelt
på NAIS-oppsettet og lokale/e2e-oppsett, noe som gjorde det nødvendig å
vedlikeholde flere tilsvarende konfigurasjoner.

Andre frontendapplikasjoner bruker allerede Express som server. I tillegg
ønsker vi å kunne erstatte MSAL-innloggingen i React-appen med Wonderwall
som sidecar og det NAV-utviklede Oasis-biblioteket for tokenutveksling.
En Express-server gir et naturlig sted å integrere server-side
autentisering og tokenutveksling, og legger til rette for en slik overgang.

Vi ønsket derfor å samle serveroppførselen med applikasjonen, gjøre den
enklere å teste og redusere konfigurasjonsduplisering, uten å endre hvordan
frontend og backend kommuniserer nå.

## Beslutning

Vi erstatter nginx med en Node.js-server bygget med Express, levert sammen
med frontend-appen. Express-serveren har ansvar for statiske filer og
SPA-fallback, runtime-konfigurasjon fra miljøvariabler, og proxying av API-
kall til melosys, trygdeavtale og faktureringskomponenten.

Serveren eksponerer egne liveness- og readiness-endepunkter, har graceful
shutdown ved `SIGTERM`, og setter eksplisitte grenser og feilhåndtering for
proxy-kall.

## Konsekvenser

**Positive**
- Serverlogikk og frontend distribueres samlet, uten en separat nginx-
  konfigurasjon.
- Routing, runtime-konfigurasjon og proxy-oppførsel kan testes med
  automatiserte HTTP-tester.
- Frontendserveren logger HTTP-forespørsler som strukturerte JSON-logger,
  som gjør loggene enklere å søke i og analysere.
- Miljøspesifikk runtime-konfigurasjon genereres fra miljøvariabler ved
  forespørsel, i stedet for å bygges inn i nginx-konfigurasjon.
- Eksplisitte helseendepunkter og graceful shutdown gir mer forutsigbar
  drift i NAIS.
- Node.js-runtime gjør det mulig å bruke NAIS sin autoinstrumentering for
  Node-applikasjoner.
- Serveren gir et grunnlag for senere å flytte autentisering og
  tokenutveksling ut av React-appen og over til Wonderwall og Oasis. Dette
  får først effekt dersom appen migreres fra FSS til GCP.

**Avveininger**
- Teamet må vedlikeholde en egen Node/Express-server og dens avhengigheter.
- Enkelte svar og stikanomalier avviker fra tidligere nginx-oppførsel.
