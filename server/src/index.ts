import config from "./config.js";
import logger from "./logger.js";
import server from "./server.js";

const { host, port } = config.app;

server.listen(port, host, () => {
  logger.logger.info(`melosys-web-server startet på ${host}:${port}`);
});
