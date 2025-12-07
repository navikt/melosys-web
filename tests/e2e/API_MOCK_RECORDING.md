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

### Prerequisites: Starting melosys-api

Recording mode requires the real `melosys-api` backend to be running. Start it from the melosys-api repository:

```bash
# From melosys-api directory (requires melosys-docker-compose services running)
cd /path/to/melosys-api
java -jar -Dspring.profiles.active=local-mock app/target/melosys-sb-execution.jar

# Or run via Maven (slower startup)
mvn spring-boot:run -pl app -Dspring-boot.run.profiles=local-mock
```

**Note**: The `local-mock` profile connects to mocked external services (PDL, EESSI, etc.) via `melosys-docker-compose`.

Verify API is running:
```bash
curl http://localhost:8080/internal/health
# Should return: {"status":"UP"}
```

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

The mock server matches requests using a priority-based strategy:

1. **Exact match**: method + path + query + body hash (highest priority)
2. **Query parameter match**: For GET requests, finds best match by query parameters
3. **Path segment match**: For paths with dynamic IDs (MEL-XXXX, numeric IDs, UUIDs)
4. **Normalized path**: `/api/fagsaker/MEL-1001` → `/api/fagsaker/:saksnummer`
5. **GraphQL**: operationName + variables hash

### Dynamic vs Static Path Handling

The matcher distinguishes between two types of paths:

**Dynamic paths** (contain MEL-XXXX, numeric IDs, or UUIDs):
- Example: `/api/fagsaker/MEL-1015/behandlingstyper/...`
- Uses path-only matching with sequence tracking
- Ensures revisiting a sak returns correct data (MEL-1015 → MEL-1071 → MEL-1015)

**Static paths** (no dynamic segments):
- Example: `/api/behandlingstemaer/hent-lovlige-kombinasjoner/?sakstype=EU_EOS`
- Uses query parameter matching to find the correct response
- Different query params return different recordings (e.g., EU_EOS vs AVTALELAND)

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

1. **Last request timing**: The last API request of a test may fail to record if the browser closes before it completes. This can cause incomplete recordings that work locally but fail in CI. **Fix**: Add explicit waits after form submissions that trigger API calls:
   ```typescript
   await page.click('button[type="submit"]');
   await page.waitForResponse(resp => resp.url().includes('/api/behandlinger'));
   ```

2. **Parallel workers**: Recording works with parallel workers, but each worker writes to separate files

3. **GraphQL**: GraphQL queries are matched by `operationName` - queries without operation names may not match correctly

4. **Test isolation with shared test data**: Tests that use the same `USER_ID_VALID` or other shared identifiers can interfere with each other when running in parallel. See "Test Isolation" section below.

5. **Write-then-read consistency**: Tests that mutate state (POST/PUT) and then verify the updated state (GET) don't work correctly in playback mode. The mock server returns pre-recorded responses, so the second GET returns stale data from before the mutation. See "Write-Then-Read Pattern" section below.

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

## Write-Then-Read Pattern (Playback Limitation)

### Problem

Some tests follow a "write-then-read" pattern:
1. Create or modify data (POST/PUT request)
2. Navigate away or refresh
3. Verify the updated data is visible (GET request)

In playback mode, this doesn't work because:
- The POST/PUT is matched and returns a recorded response (but doesn't actually modify state)
- The subsequent GET returns the **pre-recorded** response from before the mutation
- The test fails because it expects to see the updated state

### Example: AC2 Test

```typescript
// This test creates a new behandling, then verifies it appears in the saker list
test("AC2: Utenfor avtaleland med åpen årsavregning", async ({ page }) => {
  // 1. Navigate and create new årsavregning behandling
  await opprettNySakPage.klikkOpprettNyBehandling();  // POST - mutation

  // 2. Navigate back to opprett ny sak
  await hovedsidePage.goto();

  // 3. Try to verify the sak now shows the new behandling
  await opprettNySakPage.fyllInnBrukerId(USER_ID_VALID);
  // GET /api/fagsaker/sok returns PRE-MUTATION state - test fails!
});
```

### Current Workaround

Skip tests with write-then-read patterns in playback mode:

```typescript
import { getTestMode } from "../../../config/mode";

test("Test that requires mutable state", async ({ page }) => {
  test.skip(getTestMode() === "playback", "Requires mutable state - incompatible with playback mode");
  // ... test code
});
```

### Tests Skipped in Playback Mode

Currently, all tests work in playback mode thanks to global sequence-based matching.

### Previously Skipped Tests (Now Fixed)

| Test File | Test Name | Fix Applied |
|-----------|-----------|-------------|
| `utenfor-avtaleland-behandlingslogikk.spec.ts` | AC2: Utenfor avtaleland med åpen årsavregning | Added missing `behandlingsårsak` selection and `waitForURL` to ensure POST is captured. |
| `utenfor-avtaleland-behandlingslogikk.spec.ts` | AC3: Utenfor avtaleland med avsluttet behandling | Implemented sequence-based matching - mock server now returns responses in order when multiple recordings exist for the same request. |
| `eu-eos-trygdeavgift.spec.ts` | skal vise inntektskilder når bruker ikke er skattepliktig | Fixed with global sequence tracking for all matching strategies (not just exact matches). Now works correctly with write-then-read pattern. |

### Implemented Solution: Global Sequence-Based Matching

We implemented **sequence-aware matching** with global consumption tracking for all matching strategies:

1. **Global sequence tracking**: The mock server tracks consumed exchanges globally across all matching strategies (exact, path segment, query, body similarity). When a recording is returned, it's marked as consumed. Subsequent identical requests return the next unconsumed recording.
   ```typescript
   // Example: Three GET /api/behandlinger/1034/helseutgift-dekkes-perioder in one test
   // First call  → returns 204 (before mutation)
   // Second call → returns 200 (after mutation - updated data!)
   // Third call  → returns 304 (cached)
   ```

2. **No deduplication**: The loader preserves ALL recorded exchanges (including duplicates with same request signature). This enables sequence-based playback.
   ```
   [Loader] Loaded 1388 exchanges (preserving duplicates for sequence matching)
   ```

3. **Mutation tracking**: All POST/PUT/DELETE/PATCH requests are tracked for debugging
   ```
   [MutationTracker] Recorded mutation #1: POST /api/behandlinger/:behandlingId/helseutgift-dekkes-perioder
   ```

4. **Test isolation**: Sequence tracking resets before each test via `/__reset` endpoint
   - Playwright fixtures automatically call reset in playback mode
   - Each test starts with fresh sequence counters

**How it works**:
1. During recording, ALL API responses are captured in order (including duplicates)
2. The loader preserves all recordings without deduplication
3. The matcher maintains a `consumedExchanges` Set to track which recordings have been returned
4. When a request matches multiple recordings, the first unconsumed one is returned
5. When all are consumed, the last recording is reused (sticky behavior for repeated requests)

**Why this works for write-then-read patterns**:
- GET before POST: Returns recording #1 (204 empty state)
- POST: Returns recorded response
- GET after POST: Returns recording #2 (200 with updated data!)
- No need to understand API semantics - just replay in sequence

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

### Issue 4: Path Parameter Matching Returns Wrong Recordings

**Symptom**: Tests for `MEL-1026` receive data for `MEL-1001`, causing UI to show wrong sakstype.

**Root Cause**: Normalized path matching (`/api/fagsaker/:saksnummer`) returned the first candidate without checking if the actual saksnummer/ID matched.

**Fix** (matcher.ts): Added `findBestPathMatch()` method that:
1. Extracts dynamic segments (MEL-XXXX, numeric IDs, UUIDs) from request path
2. Compares with candidate recording paths
3. Returns exact match based on path segment values

```typescript
private findBestPathMatch(candidates, requestPath): RecordedExchange | null {
  // Extract dynamic segments and require exact match
  // MEL-1026 must match recordings with MEL-1026, not MEL-1001
}
```

---

### Issue 5: Non-JSON Bodies Cause Parse Errors

**Symptom**: `POST /api/avklartefakta/313/ukjent-sluttdato-medlemskapsperiode` fails with `SyntaxError: "false" is not valid JSON`

**Root Cause**: Express `json()` middleware with `strict: true` (default) rejects primitive values like `false`, `true`, numbers.

**Fix** (server.ts): Configure JSON parser with `strict: false`:
```typescript
app.use(express.json({ limit: "10mb", strict: false }));
app.use(express.text({ type: "*/*", limit: "10mb" }));
```

---

### Issue 6: Test Passes Locally But Fails in CI (Incomplete Recording) - RESOLVED

**Symptom**: AC2 test in `utenfor-avtaleland-behandlingslogikk.spec.ts` passes locally in playback mode but times out in CI with "Venter..." (loading spinner) stuck on the page.

**Evidence**:
1. The AC2 recording only has `POST /graphql/` and `POST /api/fagsaker/sok`
2. **Missing**: POST to create the årsavregning behandling
3. Locally with 1 worker: Test runs faster, passes by accident
4. CI with 2 workers: Resource contention exposes the missing recording → timeout

**Root Cause**: Two issues combined:
1. **Missing form field**: The test didn't select a `behandlingsårsak` (required for Årsavregning), so form validation silently failed
2. **Timing issue**: Even if form was valid, the test didn't wait for the POST to complete before navigating away

**Fix** (utenfor-avtaleland-behandlingslogikk.spec.ts):
```typescript
await opprettNySakPage.velgBehandlingstypeRadio("Årsavregning");

// 1. Select the required behandlingsårsak field
await opprettNySakPage.velgBehandlingsaarsak("Søknad");

// 2. Wait for navigation (which only happens after successful POST)
await Promise.all([
  page.waitForURL(/\/melosys\/$/, { timeout: 15000 }),
  opprettNySakPage.klikkOpprettNyBehandling(),
]);

// 3. Ensure all network activity is captured
await page.waitForLoadState("networkidle");
```

**Key Learnings**:
- Always check screenshot/video artifacts when tests fail - the validation error was visible
- Use `waitForURL` instead of `waitForResponse` when form success triggers navigation
- Forms may have required fields that aren't immediately obvious from the test flow

---

### Issue 7: Write-Then-Read Pattern Incompatible with Playback - RESOLVED

**Symptom**: AC3 test closes a behandling, navigates away, then verifies the updated state. In playback mode, the GET after mutation returns stale pre-recorded data.

**Test Flow**:
```
1. Navigate to behandling page     → GET (pre-mutation state)
2. Close behandling                → POST (mutation)
3. Navigate to hovedside           → Navigation
4. Search for sak                  → GET (expects post-mutation state!)
5. Verify behandlingstyper         → FAILS - sees pre-mutation state
```

**Root Cause**: The mock server uses request signature matching. Both GET requests (#1 and #4) have identical signatures, so they return the same pre-recorded response - the pre-mutation state.

**Solution Implemented**: Sequence-based matching with test isolation.

The mock server now:
1. **Tracks consumed responses**: When multiple recordings exist for the same request signature, returns them in sequence
2. **Tracks mutations**: Records all POST/PUT/DELETE/PATCH requests for debugging
3. **Resets between tests**: The `/__reset` endpoint clears sequence tracking
4. **Test isolation**: Playwright fixtures automatically call `/__reset` before each test in playback mode

**Key Files**:
- `mock-server/src/mutation-tracker.ts` - Tracks mutations during playback
- `mock-server/src/matcher.ts` - Sequence-based response selection
- `mock-server/src/server.ts` - Reset endpoint and mutation tracking middleware
- `recording/fixtures.ts` - Automatic reset before each test

**Example Log Output**:
```
[Matcher] Exact match (sequence 1/2): POST /api/fagsaker/sok
...
[Matcher] Exact match (sequence 2/2): POST /api/fagsaker/sok
```

---

### Issue 8: Stale Recording with Dynamic behandlingID

**Symptom**: Test fails with wrong data displayed (e.g., "Yrkesaktiv" instead of "Pensjonist") even though recording exists.

**Root Cause**: BehandlingID is dynamically assigned when testdata is reset. If recordings were made with a different testdata state:
1. Recording has `behandlingID=366` (old testdata)
2. Current testdata has `behandlingID=738` for the same MEL-xxxx sak
3. Mock server can't find exact match for `/api/behandlinger/738`
4. Falls back to normalized path matching (`/api/behandlinger/:behandlingId`)
5. Returns **first** match from ALL recordings, which may be from a different test with wrong data

**Example**: `eu-eos-trygdeavgift.spec.ts` recording has behandlingID=366 (PENSJONIST), but metadata says MEL-1054 has behandlingID=738. Mock server returns data from FTRL tests (YRKESAKTIV) instead.

**Fix Options**:
1. **Re-record the test** with current testdata (requires real API running)
2. **Improve mock server matching** to prefer recordings from same test file when using normalized paths
3. **Use stable test identifiers** that don't change across testdata resets

**Workaround**: Skip the test until it can be re-recorded:
```typescript
test.skip("test name", async ({ page }) => {
  // Recording has stale behandlingID, needs re-recording
});
```

---

## Current Status (as of 2025-12-07)

| Mode | Passed | Failed | Skipped | Notes |
|------|--------|--------|---------|-------|
| **Record (live API)** | 52 | 10 | 1 | 10 failing (årsavregning), 1 skipped |
| **Playback (mock)** | 52 | 10 | 1 | ✅ All mock-compatible tests pass! |

**Playback mode is fully functional!**
- AC2 was fixed by adding missing `behandlingsårsak` selection and proper `waitForURL`
- AC3 now works via sequence-based matching (write-then-read pattern supported)
- **eu-eos-trygdeavgift** now works via global sequence tracking for all matching strategies

### Pre-existing Test Failures (10 tests)

These tests fail in **both** record and playback modes - they are test/application issues, not mock server issues:

1. `aarsavregning-delt-grunnlag.spec.ts` (10 tests) - All "delt grunnlag" årsavregning tests

**Note:** `send-brev-validering.spec.ts` årsavregning brevmal test is also skipped due to pre-existing application issue.

---

## CI/CD Integration

### GitHub Actions Workflow

The playback mode enables running E2E tests in CI without requiring a full backend stack.

**Workflow file:** `.github/workflows/e2e-playback.yml`

```yaml
name: E2E Tests (Playback)

on:
  pull_request:
  push:
    branches: [master, main]
  workflow_dispatch:

jobs:
  e2e-playback:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          registry-url: https://npm.pkg.github.com/
          scope: "@navikt"
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - run: npx playwright install --with-deps chromium
      - run: |
          pnpm e2e:mock:install
          pnpm e2e:mock:build
      - run: pnpm test:e2e:playback
        env:
          CI: true
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: tests/e2e/reports/playwright-report/
          retention-days: 7
```

### CI-Specific Configuration

**Status:** Fixed! CI tests now use increased timeouts to account for slower CI environment.

**Root Cause Analysis:**
The mock server was working correctly (confirmed via logs showing successful API responses).
The issue was that CI environments are slower than local development machines, causing
`page.goto()` to timeout before pages could load with 4 parallel workers competing for resources.

**Solution (implemented in `playwright.config.ts`):**
- Added `CI_TIMEOUT_MULTIPLIER = 3` when `process.env.CI` is true
- **Playback mode uses 1 worker** - required because mock server has global sequence tracking
  that doesn't support parallel workers (they would consume recordings and reset state
  independently, causing race conditions)
- Live/record mode uses 4 workers locally, 2 in CI
- All timeouts are multiplied by 3x in CI:
  - `navigationTimeout`: 8s → 24s
  - `actionTimeout`: 4s → 12s
  - `testTimeout`: 15s → 45s
  - `expectTimeout`: 8s → 24s

**Worker Configuration by Mode:**

| Mode | Local | CI |
|------|-------|-----|
| Playback | 1 | 1 |
| Live/Record | 4 | 2 |

**Timeout Configuration:**

| Setting | Local | CI |
|---------|-------|-----|
| Navigation timeout | 8s | 24s |
| Action timeout | 4s | 12s |
| Test timeout | 15s | 45s |
| Expect timeout | 8s | 24s |

### Docker Deployment

For CI environments, the mock server can run as a Docker container:

```bash
# Build and run mock server in Docker
pnpm e2e:mock:docker:build
pnpm e2e:mock:docker:up

# Run tests against containerized mock server
E2E_MODE=playback pnpm playwright test
```

### Recording Updates Workflow

When API contracts change:

1. Developer runs `pnpm test:e2e:record` locally against live API
2. Review changes in `tests/e2e/recordings/`
3. Commit recordings with code changes
4. CI runs playback tests against committed recordings

---

## TODO / Future Improvements

### High Priority
- [ ] Fix pre-existing 10 test failures (application/test issues in årsavregning)

### Medium Priority
- [ ] Merge recordings from parallel workers
- [ ] Add staleness detection for old recordings
- [ ] Docker compose setup for CI environment
- [ ] Refactor tests to use unique test data per file (enable full parallelization)

### Completed
- [x] ~~Implement shared recording extraction (kodeverk, etc.)~~ - Partially done via query matching
- [x] ~~Add CI/CD integration with GitHub Actions~~ - Workflow created and working
- [x] ~~Fix CI playback failures~~ - Fixed via CI_TIMEOUT_MULTIPLIER (3x timeouts + 2 workers)
- [x] ~~Test playback mode end-to-end~~ - Working locally (52/64 tests pass, 0 skipped, 10 pre-existing failures)
- [x] ~~Investigate remaining playback-specific failures~~ - Fixed via path matching improvement + AC2 fix
- [x] ~~Implement stateful mock server~~ - Sequence-based matching enables write-then-read tests (AC3)
- [x] ~~Fix eu-eos-trygdeavgift.spec.ts~~ - Added global sequence tracking for all matching strategies (not just exact matches). Write-then-read pattern now fully supported.
