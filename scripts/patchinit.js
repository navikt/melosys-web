const fs = require("fs");
const dotenv = require("dotenv-save");

const createDotEnvFileIfnotExists = (dir = `${process.cwd()}/.env`) => !fs.existsSync(dir) && fs.writeFileSync(dir, "");
createDotEnvFileIfnotExists();
const DEFAULT_MOCK_SERVER_PORT = "3002";

dotenv.set("REACT_APP_NAME", "Melosys");
dotenv.set("REACT_APP_API_BASE_URL", "/api/");
dotenv.set("REACT_APP_TRYGDEAVTALE_FLYT_BASE_URL", "/trygdeavtale-flyt/");
dotenv.set("REACT_APP_GRAPHQL_URL", "/graphql/");
dotenv.set("REACT_APP_LOCAL_CONTEXT", "");
dotenv.set("REACT_APP_LOCAL_API_PORT", DEFAULT_MOCK_SERVER_PORT);
