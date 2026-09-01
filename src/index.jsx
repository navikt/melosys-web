// Må stå før alt som drar inn appkoden: schemaene i ducks/form bygges på modulnivå og
// bruker de egendefinerte yup-metodene, så de må være registrert først. Importeres et
// slikt schema indirekte av App-treet, feiler det ellers med "erIkkeBlank is not a function".
import "./setupYup";

import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { ApolloProvider } from "@apollo/client";
import { Router } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import AppErrorBoundary from "./felleskomponenter/appErrorBoundary/appErrorBoundary";

import "./index.less";
import "@navikt/ds-css";

import { store, history } from "./store";
import { unregister } from "./registerServiceWorker";
import { FellesHandlersProvider } from "./contexts";
import Modals from "./modals";
import { apolloClient } from "./graphql";
import Routing from "./routing";
import { queryClient } from "./services/queryClient";

const environment = window.env.ENVIRONMENT;
const isDevelopmentProfile = environment === "local";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ReduxProvider store={store}>
    <Router history={history}>
      <ApolloProvider client={apolloClient}>
        <QueryClientProvider client={queryClient}>
          <App isDevelopmentProfile={isDevelopmentProfile}>
            <AppErrorBoundary>
              <FellesHandlersProvider>
                <Routing />
                <Modals />
              </FellesHandlersProvider>
            </AppErrorBoundary>
          </App>
        </QueryClientProvider>
      </ApolloProvider>
    </Router>
  </ReduxProvider>,
);

unregister();
