import React from "react";
import PT from "prop-types";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import Rammeverk from "./sider/rammeverk";
import { msalConfig } from "./auth/authConfig";

export function App({ children }) {
  const isDevelopmentProfile = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
  const pca = isDevelopmentProfile ? null : new PublicClientApplication(msalConfig);

  Sentry.init({
    dsn: "https://69e47f5f658e4a7c956dbaf975f6b575@sentry.gc.nav.no/156",
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
  });

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
};

App.defaultProps = {
  children: undefined,
};

export default App;
