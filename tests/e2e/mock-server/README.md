# melosys-api Mock Server

En lett mock-server som spiller av innspilte API-responser for E2E-tester.

## Oversikt

Denne mock-serveren erstatter `melosys-api` under E2E-testkjøring, slik at tester kan kjøres uten full backend-infrastruktur.

### Arkitektur

```text
RECORD MODE:
  Playwright Test → Vite (3333) → melosys-api (8080)
       ↓
  Route Interception → recordings/*.json

PLAYBACK MODE:
  Playwright Test → Vite (3333) → mock-server (8080)
                                      ↑
                              reads recordings/*.json
```

## Bruk

### 1. Installere avhengigheter

```bash
# Fra melosys-web root
pnpm e2e:mock:install

# Eller direkte
cd tests/e2e/mock-server && npm install
```

### 2. Bygge mock-serveren

```bash
pnpm e2e:mock:build
```

### 3. Kjøre E2E-tester

**Live mode** (standard - mot ekte API):

```bash
pnpm test:e2e
```

**Record mode** (spill inn responser):

```bash
# Krever at melosys-api kjører
pnpm test:e2e:record
```

**Playback mode** (spill av innspilte responser):

```bash
pnpm test:e2e:playback
```

### 4. Bruke Docker

```bash
# Bygg Docker image
pnpm e2e:mock:docker:build

# Start mock-server med docker compose
pnpm e2e:mock:docker:up

# Stopp
pnpm e2e:mock:docker:down
```

## Recordings-format

Innspilte responser lagres i `tests/e2e/recordings/`:

```text
recordings/
├── metadata.json           # Test metadata (saksnummer, behandlingID, etc.)
├── shared/                 # Felles responser (kodeverk, etc.)
│   └── kodeverk.json
└── specs/                  # Per-test responser
    └── basic/
        └── hovedside.spec/
            └── hovedsiden-lastes-korrekt.json
```

### Recording JSON-format

```json
{
  "version": "1.0",
  "recordedAt": "2025-12-03T10:30:00Z",
  "testFile": "specs/basic/hovedside.spec.ts",
  "testName": "Hovedsiden lastes korrekt",
  "exchanges": [
    {
      "request": {
        "id": "abc123",
        "method": "GET",
        "pathname": "/api/fagsaker/MEL-1001",
        "normalizedPath": "/api/fagsaker/:saksnummer",
        "query": {},
        "body": null
      },
      "response": {
        "status": 200,
        "body": { "saksnummer": "MEL-1001" }
      },
      "duration": 45,
      "dynamicFields": ["opprettetTidspunkt"]
    }
  ]
}
```

## Request Matching

Mock-serveren matcher requests i følgende prioritet:

1. **Eksakt match**: method + path + query + body hash
2. **Normalisert path**: `/api/fagsaker/MEL-1001` → `/api/fagsaker/:saksnummer`
3. **GraphQL**: operationName + variables hash

### Støttede path-normaliseringer

| Mønster | Placeholder |
|---------|-------------|
| `/MEL-\d+` | `:saksnummer` |
| `/fagsaker/\d+` | `/fagsaker/:id` |
| `/behandlinger/\d+` | `/behandlinger/:behandlingId` |
| `/\d{11}` | `:fnr` |
| UUID | `:uuid` |

## Dynamiske verdier

Følgende felt transformeres automatisk mellom innspilling og avspilling:

- `opprettetTidspunkt`
- `endretTidspunkt`
- `sistOppdatert`
- `fom`, `tom`
- Andre dato-relaterte felt

## Miljøvariabler

| Variabel | Default | Beskrivelse |
|----------|---------|-------------|
| `PORT` | `8080` | Server-port |
| `RECORDINGS_PATH` | `../recordings` | Sti til recordings |
| `LOG_REQUESTS` | `true` | Logg alle requests |
| `TRANSFORM_DATES` | `true` | Transformer datoer |

## Endpoints

### Health check

```bash
GET /health
```

Returnerer:

```json
{
  "status": "ok",
  "mode": "playback",
  "recordings": {
    "totalFiles": 42,
    "totalExchanges": 256
  }
}
```

### API endpoints

Alle `/api/*` og `/graphql` requests matches mot recordings.

## Workflow for regenerering

Når API-et endres, må recordings oppdateres:

```bash
# 1. Start full stack
cd ../melosys-docker-compose && make start-all
# Start melosys-api i IDE

# 2. Kjør tester i record mode
pnpm test:e2e:record

# 3. Commit oppdaterte recordings
git add tests/e2e/recordings/
git commit -m "chore: oppdater E2E recordings"
```

## Feilsøking

### "No recording found"

Hvis du får feilmeldingen "No recording found":

1. Sjekk at recordings finnes i `tests/e2e/recordings/`
2. Verifiser at request matcher et innspilt mønster
3. Kjør tester i record mode for å spille inn manglende responses

### GraphQL feil

For GraphQL, sjekk at:

1. `operationName` er satt i query
2. Variables matcher (eller er tilsvarende)

## Utvikling

### Lokal kjøring

```bash
cd tests/e2e/mock-server
npm install
npm run dev
```

### Bygge

```bash
npm run build
npm start
```

### Testing

```bash
# Start server
npm start

# Test health endpoint
curl http://localhost:8080/health
```
