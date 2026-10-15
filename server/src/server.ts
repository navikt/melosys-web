import express from "express";

import { setupActuators } from "./actuators.js";
import { setupApiProxy } from "./apiProxy.js";
import { errorHandling } from "./errorHandler.js";
import { setupEnvConfigRoute } from "./envConfigRoute.js";
import logger from "./logger.js";
import { setupStaticRoutes } from "./staticRoutes.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

setupActuators(app);
app.use(logger.morganMiddleware);

setupEnvConfigRoute(app);
setupApiProxy(app);
// Catch-all for statiske filer + SPA-fallback, må settes opp sist.
setupStaticRoutes(app);

app.use(errorHandling);

export default app;
