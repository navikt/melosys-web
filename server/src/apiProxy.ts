import { NextFunction, Request, Response, Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

import config from "./config.js";
import logger from "./logger.js";

// Tilsvarer nginx sin standard client_max_body_size. Sjekkes kun mot
// Content-Length-headeren (uten å konsumere selve streamen), siden en
// data-lytter foran proxyen ville tømt streamen før proxyen får sendt den
// videre til backend.
const MAX_BODY_BYTES = 1_048_576;

// Tilsvarer nginx sin proxy_read_timeout: hvor lenge vi venter på svar fra
// backend før vi gir opp og svarer med feil selv.
const PROXY_TIMEOUT_MS = 60_000;

/**
 * Proxy-ruter for backend-API-ene:
 *
 *   /api/               -> APP_URL_MELOSYS/api/
 *   /trygdeavtale-flyt/ -> APP_URL_TRYGDEAVTALE/flyt/
 *   /faktureringskomponenten/ -> APP_URL_FAKTURERINGSKOMPONENTEN/
 *   /graphql/           -> APP_URL_MELOSYS/graphql/
 *
 * `xfwd: true` sørger for at X-Forwarded-Host/-Server/-For settes på
 * requesten videre til upstream.
 */
export function setupApiProxy(router: Router) {
  addProxy(router, "/api", `${config.upstreams.melosysApiUrl}/api`);
  addProxy(router, "/trygdeavtale-flyt", `${config.upstreams.trygdeavtaleUrl}/flyt`);
  addProxy(router, "/faktureringskomponenten", config.upstreams.faktureringskomponentenUrl);
  addProxy(router, "/graphql", `${config.upstreams.melosysApiUrl}/graphql`);

  // /melosys/api ble tidligere proxyet til samme mål som /api, men brukes
  // ikke av frontend-koden. I stedet for å la kall her falle gjennom til
  // SPA-fallbacken (som ville gitt 200 + index.html), svarer vi eksplisitt
  // 404 slik at en eventuell bruker av den gamle stien får en tydelig feil.
  router.use("/melosys/api", (_request, response) => {
    response.sendStatus(404);
  });
}

function addProxy(router: Router, path: string, target: string) {
  router.use(
    path,
    limitBodySize,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      xfwd: true,
      proxyTimeout: PROXY_TIMEOUT_MS,
      logger: logger.logger,
      on: {
        error: (error, _request, response) => {
          logger.logger.error(`Feil ved proxying til ${target}: ${error.message}`);
          // Svar 502 uten å eksponere backend-adressen til klienten. Dette
          // dekker både at backend bryter forbindelsen og at proxyTimeout
          // slår inn (httpxy gir "socket hang up" i begge tilfeller, så de
          // kan ikke skilles pålitelig for å gi 504 spesifikt på timeout).
          if ("writeHead" in response && !response.headersSent) {
            response.writeHead(502, { "Content-Type": "text/plain" });
            response.end("502 Bad Gateway");
          }
        },
      },
    }),
  );
}

function limitBodySize(request: Request, response: Response, next: NextFunction) {
  const contentLength = Number(request.headers["content-length"]);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    response.sendStatus(413);
    return;
  }

  next();
}
