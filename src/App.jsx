import PT from "prop-types";
import * as Sentry from "@sentry/react";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import Rammeverk from "./sider/rammeverk";
import { msalConfig } from "./auth/authConfig";

import "./nav-style/grid.css";

export function App({ children = undefined, isDevelopmentProfile = false }) {
  const pca = isDevelopmentProfile ? null : new PublicClientApplication(msalConfig);

  return (
    <div className="App">
      {isDevelopmentProfile ? (
        <Rammeverk isDevelopmentProfile={isDevelopmentProfile}>{children}</Rammeverk>
      ) : (
        <MsalProvider instance={pca}>
          <Rammeverk>{children}</Rammeverk>
        </MsalProvider>
      )}
    </div>
  );
}

App.propTypes = {
  children: PT.node,
  isDevelopmentProfile: PT.bool,
};

export default Sentry.withProfiler(App);
