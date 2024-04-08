import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { ApolloProvider } from "@apollo/client";
import * as Sentry from "@sentry/react";
import { Breadcrumbs } from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { CaptureConsole } from "@sentry/integrations";
import { Router } from "react-router-dom";
import App from "./App";

import "./setupYup";
import "./index.css";
import "@navikt/ds-css";

import { store, history } from "./store";
import { unregister } from "./registerServiceWorker";
import { FellesHandlersProvider } from "./contexts";
import Modals from "./modals";
import { apolloClient } from "./graphql";
import Routing from "./routing";

const SideLoadingFailMessage = <p>Beklager, kunne ikke laste inn siden.</p>;

const environment = window.env.ENVIRONMENT;
const isDevelopmentProfile = environment === "local";

const sentryIntegrations = [
  new BrowserTracing({
    routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
  }),
  new CaptureConsole({
    levels: ["error", "warn"],
  }),
  new Breadcrumbs({ console: false }),
];

Sentry.init({
  dsn: "https://69e47f5f658e4a7c956dbaf975f6b575@sentry.gc.nav.no/156",
  integrations: sentryIntegrations,
  tracesSampleRate: 1.0,
  environment,
  beforeSend: (event) => {
    if (isDevelopmentProfile) {
      return null;
    }
    return event;
  },
});

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ReduxProvider store={store}>
    <Router history={history}>
      <ApolloProvider client={apolloClient}>
        <App isDevelopmentProfile={isDevelopmentProfile}>
          <Sentry.ErrorBoundary fallback={SideLoadingFailMessage}>
            <FellesHandlersProvider>
              <Routing />
              <Modals />
            </FellesHandlersProvider>
          </Sentry.ErrorBoundary>
        </App>
      </ApolloProvider>
    </Router>
  </ReduxProvider>
);

unregister();
