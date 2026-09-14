import path from "node:path";

import express, { Router } from "express";

import config from "./config.js";

/**
 * Gjenskaper de resterende location-blokkene fra dagens nginx default.conf:
 *
 *   location /melosys/assets/ -> statiske filer fra bygget frontend
 *   location /melosys/       -> SPA-fallback (try_files $uri /index.html), no-cache
 *   location = /             -> permanent redirect til /melosys/
 */
export function setupStaticRoutes(router: Router) {
  const staticDir = path.resolve(config.app.staticDir);
  const indexHtmlPath = path.join(staticDir, "index.html");

  router.use(
    "/melosys/assets",
    express.static(path.join(staticDir, "assets")),
    // nginx sin `alias`-location har ingen try_files/fallback: manglende
    // filer skal gi 404, ikke falle tilbake til SPA-en.
    (_request, response) => {
      response.sendStatus(404);
    },
  );

  router.get("/", (_request, response) => {
    response.redirect(301, "/melosys/");
  });

  router.use("/melosys", (request, response, next) => {
    // Etterligner nginx: `root <staticDir>; try_files $uri /index.html;`
    // uten alias, dvs. filoppslag skjer på staticDir + full original URI
    // (inkl. /melosys-prefikset), som i praksis nesten alltid faller
    // tilbake til index.html siden bygget ikke har en fysisk "melosys"-mappe.
    const requestedPath = path.join(staticDir, request.baseUrl, request.path);

    response.setHeader("Cache-Control", "no-store, no-cache");
    response.setHeader("Expires", "0");

    response.sendFile(requestedPath, (error) => {
      if (error) {
        response.sendFile(indexHtmlPath, (fallbackError) => {
          if (fallbackError) next(fallbackError);
        });
      }
    });
  });
}
