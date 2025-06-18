// Bygg opp en env-config.mjs-fil basert på miljøvariabler fra .env-filen
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const envFileName = process.argv[2] || ".local.env";
const envPath = path.resolve(process.cwd(), envFileName);

const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Generer ESM-kompatibelt innhold
const configContent = `const envConfig = ${JSON.stringify(envConfig, null, 2)};

// Setter window.env for bakoverkompatibilitet
window.env = envConfig;

// Eksporterer som ES-modul
export default envConfig;
`;

fs.writeFileSync(path.resolve(process.cwd(), "env-config.mjs"), configContent);
