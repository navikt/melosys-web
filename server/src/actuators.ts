import { Router } from "express";

/**
 * Enkle liveness/readiness-endepunkt. Disse trengs strengt tatt ikke for
 * parity med dagens nginx-oppsett (nginx sin SPA-fallback svarer 200 på
 * melosys/health/is-alive og melosys/health/is-ready siden alt under
 * /melosys/ faller tilbake til index.html), men gir mer eksplisitte og
 * billigere helsesjekk-endepunkt for Express-serveren selv.
 */
export function setupActuators(router: Router) {
  router.get("/internal/health/liveness", (_request, response) => {
    response.json({ status: "UP" });
  });

  router.get("/internal/health/readiness", (_request, response) => {
    response.json({ status: "UP" });
  });
}
