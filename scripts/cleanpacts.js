const fs = require('fs');
const PACTS_DIR = `${process.cwd()}/pacts`;
const PACTS_FILE = `${PACTS_DIR}/melosys-web-melosys-api.json`;

if (fs.existsSync(PACTS_FILE)) {
  fs.unlinkSync(PACTS_FILE);
}
