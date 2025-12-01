/**
 * Playwright global setup - kjøres én gang før alle tester.
 * Resetter testdata i backend og cacher metadata for bruk i testene.
 */
import { resetTestData } from "./utils/testdataUtils";
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function globalSetup() {
  /* eslint-disable no-console */
  console.log("\n🔄 Global setup: Initializing test data...\n");

  try {
    const metadata = await resetTestData();
    const sakCount = Object.keys(metadata).length;
    console.log(`✅ Test data initialized: ${sakCount} saker klar for testing\n`);

    // Lagre metadata til fil slik at test-workers kan lese den
    // (Playwright kjører globalSetup i en egen prosess)
    const metadataPath = join(__dirname, ".testdata-metadata.json");
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`📁 Metadata saved to ${metadataPath}\n`);
  } catch (error) {
    console.error("❌ Failed to initialize test data:", error);
    throw error;
  }
  /* eslint-enable no-console */
}

export default globalSetup;
