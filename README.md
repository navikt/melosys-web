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
Dette starter applikasjonen med proxyinnstillinger rettet mot [melosys-api](https://github.com/navikt/melosys-api) kjørende lokalt på port 8080.

### Kjøring mot API koblet mot testmiljø

Dersom du heller ønsker å koble mot [melosys-api](https://github.com/navikt/melosys-api#lokal-utvikling) kjørende lokalt, men som er koblet på database/tjenester i et miljø, kan du kjøre følgende script:
```
npm install
npm run start:q2
```
Dette sørger for at du logger inn gjennom Azure AD i dev og sender ekte autoriseringstokens til backend. Tilgjengelige miljøer for dette er q1 og q2.

## Genering av graphql-kode

Se dokumentasjon [her](./src/graphql/README.md).

## Dokumentasjon

For å dokumentere arkitekturbeslutninger i prosjektet bruker vi Architecture Decision Records, som [beskrevet av Michael Nygard](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions).
Denne dokumentasjonsmetoden ble tatt i bruk desember 2021, og det kan derfor hende at ikke alle tidligere bestemmelser er begrunnet.

For et lettvektig ADR verktøy, se Nat Pryces' [adr-tools](https://github.com/npryce/adr-tools).
