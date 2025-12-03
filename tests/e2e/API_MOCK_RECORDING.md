# E2E API Mock Recording System

## Overview

This document describes the API recording and playback system for E2E tests. The system allows recording all API calls during test execution and playing them back via a mock server, enabling tests to run without the real `melosys-api` backend.

## Architecture

```
RECORD MODE:
  Playwright Test → Vite (3333) → melosys-api (8080)
       ↓
  Route Interception → recordings/*.json

PLAYBACK MODE:
  Playwright Test → Vite (3333) → mock-server (8080)
                                      ↑
                              reads recordings/*.json
```

## Directory Structure

```
tests/e2e/
├── config/
│   └── mode.ts                 # E2E_MODE configuration (live|record|playback)
├── recording/
│   ├── recorder.ts             # API recorder with Playwright route interception
│   └── fixtures.ts             # Playwright test fixture for recording
├── recordings/
│   ├── metadata.json           # Test metadata (saksnummer, behandlingID, etc.)
│   ├── specs/                  # Per-test recordings
│   │   └── <test-path>/
│   │       └── <test-name>.json
│   └── shared/                 # Shared recordings (kodeverk, etc.)
├── mock-server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── src/
│   │   ├── server.ts           # Express server
│   │   ├── loader.ts           # Loads recordings from disk
│   │   ├── matcher.ts          # Request matching logic
│   │   ├── dynamic-values.ts   # Date/ID transformation
│   │   └── types.ts            # Type definitions
│   └── README.md
├── scripts/
│   ├── enable-recording.sh     # Update all tests to use recording fixture
│   └── disable-recording.sh    # Revert tests to standard Playwright
└── docker-compose.mock.yml     # Docker compose for mock server
```

## Usage

### Recording Mode

Record all API responses during test execution:

```bash
# Record all tests
pnpm test:e2e:record

# Record specific test(s)
E2E_MODE=record pnpm playwright test <test-file> --workers=1 --reporter=list
```

### Playback Mode

Run tests against the mock server (no backend needed):

```bash
# First, build the mock server
pnpm e2e:mock:install
pnpm e2e:mock:build

# Run tests in playback mode
pnpm test:e2e:playback
```

### Live Mode (Default)

Run tests against the real API:

```bash
pnpm test:e2e
```

## Recording Format

Each test generates a JSON file with recorded API exchanges:

```json
{
  "version": "1.0",
  "recordedAt": "2025-12-03T21:23:27.682Z",
  "testFile": "tests/e2e/specs/basic/hovedside.spec.ts",
  "testName": "Hovedsiden lastes korrekt",
  "exchanges": [
    {
      "request": {
        "id": "b8d1080ddc67",
        "method": "GET",
        "pathname": "/api/featuretoggle",
        "normalizedPath": "/api/featuretoggle",
        "query": { "features": "..." },
        "headers": { "authorization": "[REDACTED]" },
        "body": null
      },
      "response": {
        "status": 200,
        "body": { "feature.toggle": true }
      },
      "duration": 16,
      "dynamicFields": []
    }
  ]
}
```

## Request Matching

The mock server matches requests using:

1. **Exact match**: method + path + query + body hash
2. **Normalized path**: `/api/fagsaker/MEL-1001` → `/api/fagsaker/:saksnummer`
3. **GraphQL**: operationName + variables hash

### Path Normalization Patterns

| Pattern | Placeholder |
|---------|-------------|
| `/MEL-\d+` | `:saksnummer` |
| `/fagsaker/\d+` | `:id` |
| `/behandlinger/\d+` | `:behandlingId` |
| `/\d{11}` (FNR) | `:fnr` |
| UUID | `:uuid` |

## Dynamic Value Handling

These fields are automatically transformed during playback:

- `opprettetTidspunkt`, `endretTidspunkt`, `sistOppdatert`
- `fom`, `tom`, `startdato`, `sluttdato`
- Other date-related fields

## Scripts

### Enable Recording

Updates all test files to use the recording fixture:

```bash
./tests/e2e/scripts/enable-recording.sh
```

### Disable Recording

Reverts all test files to standard Playwright:

```bash
./tests/e2e/scripts/disable-recording.sh
```

## Docker

### Build Mock Server Image

```bash
pnpm e2e:mock:docker:build
```

### Run with Docker Compose

```bash
pnpm e2e:mock:docker:up    # Start
pnpm e2e:mock:docker:down  # Stop
```

## npm Scripts

| Script | Description |
|--------|-------------|
| `test:e2e` | Run tests in live mode (default) |
| `test:e2e:record` | Run tests and record API responses |
| `test:e2e:playback` | Run tests against mock server |
| `e2e:mock:install` | Install mock server dependencies |
| `e2e:mock:build` | Build mock server |
| `e2e:mock:start` | Start mock server locally |
| `e2e:mock:docker:build` | Build Docker image |
| `e2e:mock:docker:up` | Start with Docker Compose |
| `e2e:mock:docker:down` | Stop Docker Compose |

## Workflow for Updating Recordings

When the API changes:

```bash
# 1. Start the full stack
cd ../melosys-docker-compose && make start-all
# Start melosys-api in IDE

# 2. Run tests in record mode
pnpm test:e2e:record

# 3. Commit updated recordings
git add tests/e2e/recordings/
git commit -m "chore: update E2E recordings"
```

## Known Limitations

1. **Last request timing**: The last API request of a test may fail to record if the browser closes before it completes (harmless warning message)

2. **Parallel workers**: Recording works with parallel workers, but each worker writes to separate files

3. **GraphQL**: GraphQL queries are matched by `operationName` - queries without operation names may not match correctly

## Files Modified

The recording system modifies these files:

- `playwright.config.ts` - Mode switching and HAR configuration
- `tests/e2e/globalSetup.ts` - Skip DB reset in playback mode
- `package.json` - New npm scripts
- All `*.spec.ts` files - Import from recording fixture

## TODO / Future Improvements

- [ ] Merge recordings from parallel workers
- [ ] Add staleness detection for old recordings
- [ ] Implement shared recording extraction (kodeverk, etc.)
- [ ] Add CI/CD integration
- [ ] Test playback mode end-to-end
