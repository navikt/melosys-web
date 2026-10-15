import { Router } from "express";

/**
 * Enkle liveness/readiness-endepunkt for Express-serveren, brukt av
 * NAIS for helsesjekk.
 */
export function setupActuators(router: Router) {
  router.get("/internal/health/liveness", (_request, response) => {
    response.json({ status: "UP" });
  });

  router.get("/internal/health/readiness", (_request, response) => {
    response.json({ status: "UP" });
  });
}
