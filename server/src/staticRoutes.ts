import path from "node:path";

import express, { Router } from "express";

import config from "./config.js";

/**
 * Statisk hosting av den bygde frontend-appen:
 *
 *   /melosys/assets/ -> statiske filer fra bygget frontend (404 ved manglende fil)
 *   /melosys/        -> SPA-fallback til index.html, no-cache
 *   /                -> permanent redirect til /melosys/
 */
export function setupStaticRoutes(router: Router) {
  const staticDir = path.resolve(config.app.staticDir);

  router.use(
    "/melosys/assets",
    express.static(path.join(staticDir, "assets")),
    // Manglende filer under /assets skal gi 404, ikke falle tilbake til SPA-en.
    (_request, response) => {
      response.sendStatus(404);
    },
  );

  router.get("/", (request, response) => {
    // Behold eventuelle query-parametre (f.eks. ?code=...) i redirecten.
    const queryString = request.url.includes("?") ? request.url.slice(request.url.indexOf("?")) : "";
    response.redirect(301, `/melosys/${queryString}`);
  });

  router.use("/melosys", (request, response, next) => {
    // `root`-opsjonen gjør at sendFile normaliserer stien og avviser forsøk
    // på å bryte ut av staticDir (f.eks. via "..") i stedet for å bare
    // slå stiene sammen selv.
    const relativePath = path.join(request.baseUrl, request.path);

    response.setHeader("Cache-Control", "no-store, no-cache");
    response.setHeader("Expires", "0");

    response.sendFile(relativePath, { root: staticDir }, (error) => {
      if (error) {
        response.sendFile("index.html", { root: staticDir }, (fallbackError) => {
          if (fallbackError) next(fallbackError);
        });
      }
    });
  });
}
