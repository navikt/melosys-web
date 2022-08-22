import React from "react";
import PT from "prop-types";

import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import Rammeverk from "./sider/rammeverk";
import { msalConfig } from "./auth/authConfig";

export function App({ loadInitialData, children }) {
  const pca = new PublicClientApplication(msalConfig);
  return (
    <div className="App">
      <MsalProvider instance={pca}>
        <Rammeverk loadInitialData={loadInitialData}>{children}</Rammeverk>
      </MsalProvider>
    </div>
  );
}

App.propTypes = {
  children: PT.node,
  loadInitialData: PT.func,
};

App.defaultProps = {
  children: undefined,
  loadInitialData: () => {},
};

export default App;
