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

(Det er også mulig å sette innholdet av tokenet rett i `~/.npmrc`.)

I tilfeller hvor npm ikke plukker opp dette tokenet, kan en løsning være å kjøre `npm login`:

```
npm login --scope=@OWNER --registry=https://npm.pkg.github.com
```

### Kjøring
```
npm install
npm start
```

## Genering av graphql-kode

Se dokumentasjon [her](./src/graphql/README.md).

## Dokumentering av arkitekturbeslutninger

Dato: 2021-12-22

### Status

Akseptert

### Kontekst

Vi har behov for å dokumentere arkitekturbeslutninger i dette prosjektet.

### Beslutning

Vi beslutter å bruke Architecture Decision Records, som [beskrevet av Michael Nygard](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions). Vi forsøker å legge til beslutninger tilbake i tid.

### Konsekvenser

Se Michael Nygards' artikkel, linket lenger opp. For et lettvektig ADR verktøy, se Nat Pryces' [adr-tools](https://github.com/npryce/adr-tools).

