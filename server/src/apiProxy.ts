import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

import config from "./config.js";
import logger from "./logger.js";

/**
 * Proxy-ruter for backend-API-ene:
 *
 *   /api/               -> APP_URL_MELOSYS/api/
 *   /melosys/api/       -> APP_URL_MELOSYS/api/
 *   /trygdeavtale-flyt/ -> APP_URL_TRYGDEAVTALE/flyt/
 *   /faktureringskomponenten/ -> APP_URL_FAKTURERINGSKOMPONENTEN/
 *   /graphql/           -> APP_URL_MELOSYS/graphql/
 *
 * `xfwd: true` sørger for at X-Forwarded-Host/-Server/-For settes på
 * requesten videre til upstream.
 */
export function setupApiProxy(router: Router) {
  addProxy(router, "/api", `${config.upstreams.melosysApiUrl}/api`);
  addProxy(router, "/melosys/api", `${config.upstreams.melosysApiUrl}/api`);
  addProxy(router, "/trygdeavtale-flyt", `${config.upstreams.trygdeavtaleUrl}/flyt`);
  addProxy(router, "/faktureringskomponenten", config.upstreams.faktureringskomponentenUrl);
  addProxy(router, "/graphql", `${config.upstreams.melosysApiUrl}/graphql`);
}

function addProxy(router: Router, path: string, target: string) {
  router.use(
    path,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      xfwd: true,
      logger: logger.logger,
    }),
  );
}
