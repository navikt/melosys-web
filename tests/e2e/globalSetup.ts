/**
 * Playwright global setup - kjøres én gang før alle tester.
 * Renser database og mock-data, deretter initialiserer testdata.
 */
import { resetTestData } from "./utils/testdataUtils";
import { withDatabase } from "./utils/databaseHelper";
import { writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

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

export default async function globalSetup() {
  /* eslint-disable no-console */
  console.log("\n Global setup: Initializing test data...\n");

  try {
    // 1. Slett mock-data (oppgaver, journalposter, etc.)
    console.log("Step 1: Clearing mock data...");
    await clearMockData();

    // 2. Slett Oracle testdata (e2e test-saker)
    console.log("\nStep 2: Clearing Oracle test data...");
    await clearOracleTestData();

    // 3. Initialiser testdata på nytt via API
    console.log("\nStep 3: Initializing test data...");
    const metadata = await resetTestData();
    const sakCount = Object.keys(metadata).length;
    console.log(`  Test data initialized: ${sakCount} saker klar for testing\n`);

    // Lagre metadata til temp-fil slik at test-workers kan lese den
    // (Playwright kjører globalSetup i en egen prosess)
    const metadataPath = join(tmpdir(), "melosys-e2e-testdata-metadata.json");
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`  Metadata saved to ${metadataPath}\n`);
  } catch (error) {
    console.error(" Failed to initialize test data:", error);
    throw error;
  }
  /* eslint-enable no-console */
}
