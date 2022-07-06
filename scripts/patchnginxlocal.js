const dotenv = require("dotenv-save");
const writePkg = require("write-pkg");
const readPkg = require("read-pkg");

const pkg = readPkg.sync();

const { proxy } = pkg;
const DEFAULT_NGINX_SERVER_PORT = "3000";

// update .env with custom version
dotenv.set("REACT_APP_BUILD_VERSION", "nginx_local");
dotenv.set("REACT_APP_LOCAL_CONTEXT", "/melosys");
dotenv.set("REACT_APP_GRAPHQL_URL", "/graphql/");
dotenv.set("REACT_APP_LOCAL_API_PORT", DEFAULT_NGINX_SERVER_PORT);
dotenv.set("PORT", "3001"); // Endrer port fordi Nginx kjører på port 3000

if (proxy) {
  pkg.proxy = proxy;
  writePkg.sync(pkg);
}
