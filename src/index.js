import React from "react";
import ReactDOM from "react-dom";
import { ConnectedRouter } from "connected-react-router";
import { Provider as ReduxProvider } from "react-redux";
import { ApolloProvider } from "@apollo/client";
import * as Sentry from "@sentry/react";
import { Breadcrumbs } from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { CaptureConsole } from "@sentry/integrations";
import App from "./App";

import createStore from "./store";
import routerHistory from "./history";
import Routing from "./routing";
import { unregister } from "./registerServiceWorker";
import { FellesHandlersProvider } from "./contexts";
import Modals from "./modals";
import { apolloClient } from "./graphql";
import "./index.css";
import "./setupYup";

const SideLoadingFailMessage = <p>Beklager, kunne ikke laste inn siden.</p>;

const environment = process.env.REACT_APP_ENVIRONMENT;
const isDevelopmentProfile = environment === "local";

const sentryIntegrations = [
  new BrowserTracing({
    routingInstrumentation: Sentry.reactRouterV5Instrumentation(routerHistory),
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

const store = createStore(routerHistory);

ReactDOM.render(
  <ReduxProvider store={store}>
    <ConnectedRouter history={routerHistory}>
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
    </ConnectedRouter>
  </ReduxProvider>,
  document.getElementById("root")
);

unregister();
