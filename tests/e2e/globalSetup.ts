/**
 * Playwright global setup - kjøres én gang før alle tester.
 * Renser database og mock-data, deretter initialiserer testdata.
 *
 * I playback mode (E2E_MODE=playback) hoppes database-operasjoner over
 * siden mock-serveren ikke trenger ekte testdata.
 */
import { resetTestData } from "./utils/testdataUtils";
import { withDatabase } from "./utils/databaseHelper";
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getTestMode, shouldUseMockServer, shouldRecordResponses } from "./config/mode";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path for HAR recording
const RECORDINGS_DIR = join(__dirname, "recordings");
const HAR_FILE = join(RECORDINGS_DIR, "api-recordings.har");

const MOCK_BASE_URL = process.env.MOCK_BASE_URL || "http://localhost:8083";

/**
 * Sletter all mock-data (oppgaver, journalposter, medl) før reset
 */
async function clearMockData(): Promise<void> {
  try {
    const response = await fetch(`${MOCK_BASE_URL}/testdata/clear`, {
      method: "DELETE",
    });

    if (response.ok) {
      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log(`  Mock data cleared: ${JSON.stringify(data)}`);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`  Could not clear mock data: ${response.status}`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`  Could not clear mock data (ignorerer): ${error}`);
  }
}

/**
 * Sletter testdata fra Oracle-databasen (MEL-1001 til MEL-1071)
 */
async function clearOracleTestData(): Promise<void> {
  try {
    await withDatabase(async (db) => {
      await db.cleanTestData();
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`  Could not clear Oracle test data (ignorerer): ${error}`);
  }
}

async function globalSetup() {
  /* eslint-disable no-console */
  const mode = getTestMode();
  console.log(`\n Global setup: Mode = ${mode}\n`);

  // In playback mode, skip all database operations
  if (shouldUseMockServer()) {
    console.log(" Playback mode: Skipping database setup (using mock server)");

    // Try to load existing metadata from recordings or use dummy metadata
    const metadataPath = join(tmpdir(), "melosys-e2e-testdata-metadata.json");
    const recordingsMetadataPath = join(__dirname, "recordings", "metadata.json");

    if (existsSync(recordingsMetadataPath)) {
      // Copy metadata from recordings directory
      const metadata = readFileSync(recordingsMetadataPath, "utf-8");
      writeFileSync(metadataPath, metadata);
      console.log(` Loaded metadata from recordings: ${recordingsMetadataPath}\n`);
    } else {
      // Create minimal dummy metadata for playback
      const dummyMetadata = createDummyMetadata();
      writeFileSync(metadataPath, JSON.stringify(dummyMetadata, null, 2));
      console.log(` Created dummy metadata for playback\n`);
    }

    return;
  }

  console.log(" Initializing test data...\n");

  try {
    // 1. Slett mock-data (oppgaver, journalposter, etc.)
    console.log("Step 1: Clearing mock data...");
    await clearMockData();

    // 2. Slett Oracle testdata (e2e test-saker)
    console.log("\nStep 2: Clearing Oracle test data...");
    await clearOracleTestData();

    // 3. Initialiser testdata på nytt via API (kan hoppes over med SKIP_TESTDATA_RESET=true)
    if (process.env.SKIP_TESTDATA_RESET === "true") {
      console.log("\nStep 3: Skipping test data initialization (SKIP_TESTDATA_RESET=true)");
      console.log("  Using existing metadata from recordings directory\n");

      // Use existing metadata from recordings
      const recordingsMetadataPath = join(__dirname, "recordings", "metadata.json");
      const metadataPath = join(tmpdir(), "melosys-e2e-testdata-metadata.json");

      if (existsSync(recordingsMetadataPath)) {
        const metadata = readFileSync(recordingsMetadataPath, "utf-8");
        writeFileSync(metadataPath, metadata);
        console.log(`  Loaded metadata from ${recordingsMetadataPath}\n`);
      } else {
        console.warn("  Warning: No existing metadata found, tests may fail\n");
      }
    } else {
      console.log("\nStep 3: Initializing test data...");
      const metadata = await resetTestData();
      const sakCount = Object.keys(metadata).length;
      console.log(`  Test data initialized: ${sakCount} saker klar for testing\n`);

      // Lagre metadata til temp-fil slik at test-workers kan lese den
      // (Playwright kjører globalSetup i en egen prosess)
      const metadataPath = join(tmpdir(), "melosys-e2e-testdata-metadata.json");
      writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      console.log(`  Metadata saved to ${metadataPath}\n`);

      // In record mode, also save metadata to recordings directory for playback
      if (mode === "record") {
        const recordingsMetadataPath = join(__dirname, "recordings", "metadata.json");
        writeFileSync(recordingsMetadataPath, JSON.stringify(metadata, null, 2));
        console.log(`  Metadata also saved to ${recordingsMetadataPath} for playback\n`);
      }
    }
  } catch (error) {
    console.error(" Failed to initialize test data:", error);
    throw error;
  }
  /* eslint-enable no-console */
}

/**
 * Create dummy metadata for playback mode when no recorded metadata exists.
 * This provides enough structure for tests to run with the mock server.
 */
function createDummyMetadata(): Record<string, unknown> {
  const metadata: Record<string, unknown> = {};

  // Create dummy entries for MEL-1001 to MEL-1071
  for (let i = 1001; i <= 1071; i++) {
    metadata[`MEL-${i}`] = {
      saksnummer: `MEL-${i}`,
      behandlingID: i,
      sakstype: "AVTALELAND",
      sakstema: "MEDLEMSKAP_TRYGDEAVGIFT",
      behandlingstema: "AVTALELAND_UNDER_BEHANDLING",
      behandlingstype: "FØRSTEGANGSBEHANDLING",
      behandlingsstatus: "UNDER_BEHANDLING",
    };
  }

  return metadata;
}

export default globalSetup;
