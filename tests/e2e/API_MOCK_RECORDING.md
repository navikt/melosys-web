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

4. **Test isolation with shared test data**: Tests that use the same `USER_ID_VALID` or other shared identifiers can interfere with each other when running in parallel. See "Test Isolation" section below.

## Test Isolation

### Problem: Race Conditions with Shared State

When tests share the same test data (e.g., `USER_ID_VALID = "30056928150"`), running them in parallel can cause race conditions:

- One test modifies a sak (case) while another test expects it in a different state
- Module-level variables like `let opprettNySakPage` are overwritten by parallel tests

### Solution: Serial Mode for Shared State

Add `test.describe.configure({ mode: "serial" })` to test files that share state:

```typescript
test.describe("My test suite", () => {
  // Run tests serially to avoid race conditions
  test.describe.configure({ mode: "serial" });

  let sharedPageObject: MyPage;

  test.beforeEach(async ({ page }) => {
    sharedPageObject = new MyPage(page);
  });

  // Tests will run one at a time
});
```

### Best Practices

1. **Avoid module-level state**: Prefer creating page objects inside each test or in `beforeEach`

2. **Don't duplicate navigation**: If `beforeEach` navigates to a page, don't call navigation again in the test

3. **Wait for dynamic content**: When selecting from dropdowns with async-loaded options, wait for options to be attached:
   ```typescript
   const option = select.locator(`option:text-is("${value}")`);
   await expect(option).toBeAttached({ timeout: 5000 });
   ```

4. **Use unique test data per file**: For full parallel execution, each test file should use different test identifiers (fnr, saksnummer, etc.)

### Files Using Shared Test Data

These files use `USER_ID_VALID` and may need serial mode:
- `bruker-sak-validering.spec.ts`
- `virksomhet-sak-validering.spec.ts`
- `regresjon-state-ved-saksbytting.spec.ts`
- `behandlingstype-tilgjengelighet.spec.ts`
- `avtaleland-behandlingslogikk.spec.ts`
- `eos-pensjonist-aarsavregning.spec.ts`
- `utenfor-avtaleland-behandlingslogikk.spec.ts`

## Files Modified

The recording system modifies these files:

- `playwright.config.ts` - Mode switching and HAR configuration
- `tests/e2e/globalSetup.ts` - Skip DB reset in playback mode
- `package.json` - New npm scripts
- All `*.spec.ts` files - Import from recording fixture

## Troubleshooting & Lessons Learned

### Issue 1: GraphQL Requests Not Recorded

**Symptom**: Playback mode logs `[Server] No GraphQL recording for: hentPersonopplysninger`

**Root Cause**: URL mismatch between recorder pattern and actual requests:
- Frontend uses: `/graphql/` (with trailing slash from `.local.env`)
- Recorder pattern was: `/graphql$` (no trailing slash)

**Fix** (recorder.ts:191):
```typescript
// Before
await page.route(/^https?:\/\/[^/]+\/graphql$/, ...)

// After
await page.route(/^https?:\/\/[^/]+\/graphql\/?$/, ...)
```

Also update mock server (server.ts) to handle both paths:
```typescript
app.post("/graphql", graphqlHandler);
app.post("/graphql/", graphqlHandler);
```

---

### Issue 2: Kodeverk Responses Return Wrong Data

**Symptom**: Test expects "Arbeid kun i Norge" but gets "Yrkesaktiv" options

**Root Cause**: Request ID didn't include query parameters, causing deduplication to discard important variations.

For example, these two requests got the same ID:
```
GET /api/behandlingstemaer/?sakstype=EU_EOS&sakstema=MEDLEMSKAP_LOVVALG
GET /api/behandlingstemaer/?sakstype=FTRL&sakstema=TRYGDEAVGIFT
```

**Fix** (recorder.ts):
```typescript
// Include query params in ID generation
function generateRequestId(method, pathname, query, body) {
  const queryString = Object.entries(query)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const content = `${method}:${pathname}:${queryString}:${JSON.stringify(body)}`;
  return createHash("md5").update(content).digest("hex").substring(0, 12);
}
```

Also add query parameter matching in matcher.ts for GET requests:
```typescript
private findBestQueryMatch(candidates, requestQuery) {
  // Score candidates by matching query parameters
  // Require at least 50% match
}
```

---

### Issue 3: Mock Server Returns First Match Instead of Best Match

**Symptom**: Same endpoint with different parameters returns wrong response

**Root Cause**: Normalized path matching returned the first candidate without considering query parameters.

**Fix** (matcher.ts): Added `findBestQueryMatch()` method that scores candidates by query parameter similarity and returns the best match.

---

## Current Status (as of 2025-12-06)

| Mode | Passed | Failed | Notes |
|------|--------|--------|-------|
| **Record (live API)** | 51 | 12 | 12 are pre-existing test issues |
| **Playback (mock)** | 37 | 22 | 10 additional failures in playback |

### Remaining Playback Issues

The 10 additional playback failures are likely due to:
1. Complex test flows with many API call variations not fully recorded
2. Tests that timeout (11+ seconds) - indicates missing recordings
3. Dynamic data differences between record and playback

### Next Steps for Improvement

1. **Timeout failures**: Investigate tests with 11+ second timeouts - likely missing API recordings
2. **"Knytt til eksisterende" tests**: These navigate between multiple saker and make many API calls with different parameters
3. **Consider shared recordings**: Extract common kodeverk responses to `recordings/shared/`

---

## TODO / Future Improvements

- [ ] Merge recordings from parallel workers
- [ ] Add staleness detection for old recordings
- [x] ~~Implement shared recording extraction (kodeverk, etc.)~~ - Partially done via query matching
- [ ] Add CI/CD integration
- [x] ~~Test playback mode end-to-end~~ - Working (37/59 tests pass)
- [ ] Refactor tests to use unique test data per file (enable full parallelization)
- [ ] Consider project-level serial configuration for "knytt-til-eksisterende" tests
- [ ] Investigate remaining 10 playback-specific failures
- [ ] Add logging to identify missing recordings during playback
