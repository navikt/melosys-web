import React from "react";
import ReactDOM from "react-dom";
import { ConnectedRouter } from "connected-react-router";
import { Provider as ReduxProvider } from "react-redux";
import { ApolloProvider } from "@apollo/client";

import "./index.css";
import "./setupYup";
import App from "./App";
import loadInitialData from "./startupDataLoader";

import createStore from "./store";
import routerHistory from "./history";
import Routing from "./routing";
import ErrorBoundary from "./felleskomponenter/ErrorBoundary";
import { unregister } from "./registerServiceWorker";
import { FellesHandlersProvider } from "./contexts";
import Modals from "./modals";
import { apolloClient } from "./graphql";

const SideLoadingFailMessage = "Beklager, kunne ikke laste inn siden.";

const store = createStore(routerHistory);
loadInitialData(store);

ReactDOM.render(
  <ReduxProvider store={store}>
    <ConnectedRouter history={routerHistory}>
      <ApolloProvider client={apolloClient}>
        <App>
          <ErrorBoundary message={SideLoadingFailMessage}>
            <FellesHandlersProvider>
              <Routing />
              <Modals />
            </FellesHandlersProvider>
          </ErrorBoundary>
        </App>
      </ApolloProvider>
    </ConnectedRouter>
  </ReduxProvider>,
  document.getElementById("root")
);

unregister();
