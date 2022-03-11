# Melosys
Dette er prosjektet for Melosys - Medlems og Lovvalgssystem.

## Plattform
Frontend bygger på React og Redux. For detaljer og dokumentasjon, se intern Confluence.

Applikasjonen er opprinnelig skrevet i javascript, men ny kode skal helst skrives i typescript der det er mulig.

## Struktur
Nedenfor er en beskrivelse av komponent- og containerstruktur i prosjektet.
Oversikten er ikke uttømmende, men er ment å gi en idé om den overordnede
arkitekturen for prosjektet.

### Sider (./src/sider)
Dette er selvstående skjermbilder / sider. Sider kan normalt ikke kombineres eller nøstes, men
er individuelle og tar hele nettleser-flaten.

### Felles komponenter (./src/felles-komponenter)
Dette er komponenter som gjenbrukes i diverse
sider. Komponenter kan også nøste hverandre.

## Utvikling på laptop

### Bygging
For å unngå unødvendige endringer i lockfile bør lockfileVersion 1 og npm v6 brukes.
Når man oppdaterer til node v16 / npm v7 blir dette ikke et problem lenger

Applikasjonen benytter avhengigheter fra GitHub package registry som krever autentisering for å hentes. Det er derfor nødvendig å opprette et personal access token (PAT)
fra [GitHub developer settings](https://github.com/settings/tokens), og sette dette i `~/.npmrc` på denne måten, gitt at tokenet er satt i en miljøvariabel `NPM_TOKEN`:

```shell script
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

Merk at PAT må iallefall ha tilgangene repo og read:packages.

(Det er også mulig å sette innholdet av tokenet rett i `~/.npmrc`.)

I tilfeller hvor npm ikke plukker opp dette tokenet, kan en løsning være å kjøre `npm login`:

```
npm login --scope=@OWNER --registry=https://npm.pkg.github.com
```

Bruk github-brukernavnet ditt, og PAT som passord.

### Kjøring
```
npm install
npm start
```
Dette starter applikasjonen med proxyinnstillinger rettet mot [melosys-web-mock](https://github.com/navikt/melosys-web-mock).

### Kjøring mot kjørende API

Dersom du heller ønsker å koble mot din kjørende [melosys-api](https://github.com/navikt/melosys-api#lokal-utvikling), kan du bruke følgende script for å sette proxyinnstillinger mot [melosys-docker-compose](https://github.com/navikt/melosys-docker-compose#frontendutvikling):
```
npm install
npm run start:nginxlocal
```
Dersom du ikke allerede har en token lagret i cookies på localhost, vil det ikke være mulig å få kontakt med APIet. En workaround for å få token er å først starte [docker-compose](https://github.com/navikt/melosys-docker-compose#frontendutvikling) for frontendutvikling. Logg så inn på porten som kjører frontend-containeren. Du vil da få cookies som vil være tilgjengelig på alle portene som kjører under localhost.

## Genering av graphql-kode

Se dokumentasjon [her](./src/graphql/README.md).

## Dokumentasjon

For å dokumentere arkitekturbeslutninger i prosjektet bruker vi Architecture Decision Records, som [beskrevet av Michael Nygard](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions).
Denne dokumentasjonsmetoden ble tatt i bruk desember 2021, og det kan derfor hende at ikke alle tidligere bestemmelser er begrunnet.

For et lettvektig ADR verktøy, se Nat Pryces' [adr-tools](https://github.com/npryce/adr-tools).

