import config from "./config.js";
import logger from "./logger.js";
import server from "./server.js";

const { host, port } = config.app;

const httpServer = server.listen(port, host, () => {
  logger.logger.info(`melosys-web-server startet på ${host}:${port}`);
});

// Node sin standard keep-alive-timeout (5s) er kortere enn det ingress foran
// oss forventer, noe som kan gi sporadiske 502-er hvis ingress gjenbruker en
// forbindelse Node nettopp har lukket. headersTimeout må være høyere enn
// keepAliveTimeout.
httpServer.keepAliveTimeout = 65_000;
httpServer.headersTimeout = 66_000;

// Fullfør pågående requests før prosessen avsluttes ved SIGTERM (f.eks.
// docker stop / pod-terminering ved deploy), i stedet for å kutte dem brått.
process.on("SIGTERM", () => {
  logger.logger.info("Mottok SIGTERM, avslutter etter pågående requests er fullført");
  httpServer.close(() => process.exit(0));
});
