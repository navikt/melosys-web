# 6. TanStack Query for server-state og data-fetching

Dato: 2026-05-21

## Status

Akseptert

## Kontekst

Melosys-web har siden 2018 brukt en duck-basert Redux-arkitektur (`actions`,
`operations`, `reducers`, `selectors`) for å håndtere både UI-state og server-state.
Mønsteret krever ~5 filer per ressurs for grunnleggende CRUD, og caching, deduplisering
og automatisk invalidering ved mutasjoner må håndteres manuelt — ofte mangelfullt.
RTK er installert (kun for `configureStore`), men `createSlice` / `createAsyncThunk`
brukes ikke.

For tekstblokk-featuren skal vi bygge en CRUD-side med standard hente-/oppdaterings-
mønstre. Vi ønsker:
- så lite boilerplate som mulig
- caching og automatisk refetch ved mutasjon
- et fremtidsrettet mønster som andre features kan adoptere

## Beslutning

Vi tar i bruk **TanStack Query** (`@tanstack/react-query`) for server-state.
`QueryClientProvider` settes opp i `src/index.jsx`. Hooks lever i
`src/services/api/<domene>.ts` og bruker den eksisterende fetch-wrapperen
(`src/services/modules/<domene>.ts`).

For tekstblokker konkretiseres dette som:
```
src/services/modules/tekstblokker.ts   // rene HTTP-kall + typer
src/services/api/tekstblokker.ts       // useTekstblokker, useTekstblokk,
                                       // useOpprettTekstblokk, useOppdaterTekstblokk,
                                       // useSlettTekstblokk
```

Mutasjoner invaliderer `queryKey ["tekstblokker"]`, slik at liste og detalj refetches
etter opprettelse/oppdatering/sletting. Detalj-data settes også direkte i cachen
etter `oppdater` for å unngå et ekstra round-trip.

Redux beholdes for resten av appen — vi gjør ikke en migrasjon nå. Nye features kan
velge TanStack Query der det passer; gamle features beholder ducks.

## Konsekvenser

**Positive**
- ~70 % mindre boilerplate per ressurs vs. duck-mønsteret
- Innebygget caching, deduplisering, refetch-on-mount
- Auto-genererte hooks med god TypeScript-støtte
- Devtools (`@tanstack/react-query-devtools`) — utilatt i prod-build
- Setter mønster for fremtidige features

**Avveininger**
- Ny mental modell i en kodebase som ellers er Redux-tung. Krever onboarding
  for nye utviklere på tekstblokk-koden.
- Mulig forvirring rundt "hvor bor staten" — server-state i TanStack, UI-state
  i Redux/komponent-state. Dette må forklares i onboarding.
- Hvis senere alle features migreres til TanStack, blir mye av Redux overflødig.
  Foreløpig er det greit; vi unngår en stor refaktor.

## Eksempler i kodebasen

- `src/services/queryClient.ts` — global `QueryClient`
- `src/services/modules/tekstblokker.ts` — HTTP-modul
- `src/services/api/tekstblokker.ts` — query- og mutation-hooks
- `src/sider/administrasjon/tekstblokker/` — første konsument
