import { Router } from "express";

import config from "./config.js";

/**
 * Gjenskaper /env-config.js og /melosys/env-config.js fra dagens nginx-oppsett:
 * innhold generert fra miljøvariabler, aldri cachet av nettleseren.
 */
export function setupEnvConfigRoute(router: Router) {
  const respondWithEnvConfig: import("express").RequestHandler = (_request, response) => {
    response.setHeader("Content-Type", "application/javascript; charset=utf-8");
    response.setHeader("Cache-Control", "no-store, no-cache");
    response.setHeader("Expires", "0");
    response.send(buildEnvConfigJs());
  };

  router.get("/env-config.js", respondWithEnvConfig);
  router.get("/melosys/env-config.js", respondWithEnvConfig);
}

function buildEnvConfigJs(): string {
  const envConfig = JSON.stringify(config.runtimeConfig, null, 2);
  return `const envConfig = ${envConfig};

window.env = envConfig;
export default envConfig;
`;
}
