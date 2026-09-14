import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

import config from "./config.js";
import logger from "./logger.js";

/**
 * Gjenskaper proxy-rutene fra dagens nginx default.conf 1:1:
 *
 *   location /api/               -> APP_URL_MELOSYS/api/
 *   location /melosys/api/       -> APP_URL_MELOSYS/api/
 *   location /trygdeavtale-flyt/ -> APP_URL_TRYGDEAVTALE/flyt/
 *   location /faktureringskomponenten/ -> APP_URL_FAKTURERINGSKOMPONENTEN/
 *   location /graphql/           -> APP_URL_MELOSYS/graphql/
 *
 * nginx sender også med X-Forwarded-Host/-Server/-For, som
 * http-proxy-middleware sin `xfwd`-opsjon dekker tilsvarende.
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
