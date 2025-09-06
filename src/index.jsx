import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { ApolloProvider } from "@apollo/client";
import { Router } from "react-router-dom";
import App from "./App";
import AppErrorBoundary from "./felleskomponenter/appErrorBoundary/appErrorBoundary";

import "./setupYup";
import "./index.less";
import "@navikt/ds-css";

import { store, history } from "./store";
import { unregister } from "./registerServiceWorker";
import { FellesHandlersProvider } from "./contexts";
import Modals from "./modals";
import { apolloClient } from "./graphql";
import Routing from "./routing";

const environment = window.env.ENVIRONMENT;
const isDevelopmentProfile = environment === "local";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ReduxProvider store={store}>
    <Router history={history}>
      <ApolloProvider client={apolloClient}>
        <App isDevelopmentProfile={isDevelopmentProfile}>
          <AppErrorBoundary>
            <FellesHandlersProvider>
              <Routing />
              <Modals />
            </FellesHandlersProvider>
          </AppErrorBoundary>
        </App>
      </ApolloProvider>
    </Router>
  </ReduxProvider>,
);

unregister();
