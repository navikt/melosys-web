# Melosys
Dette er prosjektet for Melosys - Medlems og Lovvalgssystem.

## Plattform
Frontend bygger på React og Redux. For detaljer og dokumentasjon, se intern Confluence.

## Struktur
Nedenfor er en beskrivelse av komponent- og containerstruktur i prosjektet.
Oversikten er ikke uttømmende, men er ment å gi en idé om den overordnede
arkitekturen for prosjektet.

### Sider (./sider)
Dette er selvstående skjermbilder / sider som refereres til gjennom
individuelle routes. Sider kan normalt ikke kombineres eller nøstes, men
er individuelle og tar hele nettleser-flaten.

| Navn             | Beskrivelse      |
| ---------------- | ---------------- |
| Rammeverk | Dette er rammeverket for applikasjonen og trekker inn Topplinje-container etc. |
| Sok | Dette er skjermbildet hvor saksbehandleren enten gjør et søk eller henter frem tidligere behandlede saker. |

### Felles komponenter (./felles-komponenter)
Dette er komponenter (stateful eller pure/stateless) som gjenbrukes i diverse
sider. Komponenter kan også nøste hverandre.

| Navn             | Beskrivelse      |
| ---------------- | ---------------- |
| Topplinje | Dette er containeren som inneholder logo, søk, saksbehandlernavn etc. |
| Medlemskap | Dette er panelet hvor medlemskap vises som en del av saksopplysningen. |
| Personopplysninger | Dette er panelet hvor personopplysninger som fødselsnummer, adresse, nasjonalitet og annen generell informasjon vises. |
| Arbeidsforholdene | Her listes alle arbeidsforhold opp, dvs innenfor en gitt periode. |
| OrganisasjonerNorge | Denne listen er utledet av aktuelle Arbeidsforholdene og viser en oppsummering av organisasjoner (arbeidsgiver) som er aktuelle for søknaden. |
| SideOppsummering | Oppsummeringen er ment å gi saksbehandleren en rask forståelse av søknadens natur og status. |
| SideDialog | Dette er en fane hvor dialog, historikk og samhandling med søker er synlig. |
| Tilleggsopplysninger | Her har søkeren selv skrevet inn tilleggsopplysninger som er relevant for søknaden. |

## Routes
Applikasjonen har ingen omfattende navigasjon, og hele saksbehandlingen
foregår på én side. Følgende routes er satt opp i applikasjonen:

| Route            | Container        | Beskrivelse      |
| ---------------- | ---------------- | ---------------- |
| /sok | Sok | Dette er grunnsiden som saksbehandleren benytter for å hente søke etter en sak eller hente tidligere behandlede saker. |
| /saksbehandling | Saksbehandling | Dette er hovedsiden i applikasjonen hvor alle nødvendige felles-komponenter er bygget inn. |

## Utvikling på laptop mot backend i dev-fss

Installer [kubefwd](https://github.com/txn2/kubefwd) eller [Kube Forwarder](https://github.com/pixel-point/kube-forwarder). Start applikasjonen med forwarding mot
ønsket miljø, f.eks. `kubefwd` mot `t8`:

```shell script
sudo -E kubefwd svc -n t8 -l app=melosys
```

Legg inn OIDC-token fra [IDA](https://ida.adeo.no) i `scripts/patchkubefwd.js`, og start frontend med forwarding mot backend i miljø:

```shell script
npm run start:kubefwd
```
