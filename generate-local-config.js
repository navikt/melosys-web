const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envFileName = process.argv[2] || ".env.local";
const envPath = path.resolve(process.cwd(), envFileName);

const envConfig = dotenv.parse(fs.readFileSync(envPath));

const configContent = `window.env = ${JSON.stringify(envConfig)};`;
fs.writeFileSync(path.resolve(process.cwd(), "env-config.js"), configContent);
