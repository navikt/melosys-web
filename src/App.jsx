import PT from "prop-types";
import * as Sentry from "@sentry/react";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import Rammeverk from "./sider/rammeverk";
import { msalConfig } from "./auth/authConfig";

import "./nav-style/grid.css";
import "nav-frontend-lukknapp-style";
import "nav-frontend-modal-style";
import "nav-frontend-skjema-style";
import "nav-frontend-snakkeboble-style";
import "nav-frontend-spinner-style";
import "nav-frontend-typografi-style";

export function App({ children, isDevelopmentProfile }) {
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

App.defaultProps = {
  children: undefined,
  isDevelopmentProfile: false,
};

export default Sentry.withProfiler(App);
