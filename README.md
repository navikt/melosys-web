# Melosys
Dette er prosjektet for Melosys - Medlems og Lovvalgssystem.

## Plattform
Frontend bygger på React og Redux. For detaljer og dokumentasjon, se intern Confluence.

Applikasjonen er opprinnelig skrevet i javascript, men ny kode skal helst skrives i typescript der det er mulig.


## Utvikling på laptop

### Bygging

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
