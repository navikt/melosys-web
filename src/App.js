import React from "react";
import PT from "prop-types";
import { useAuth } from "react-oidc-context";

import Rammeverk from "./sider/rammeverk";

export function App({ loadInitialData, children }) {
  const auth = useAuth();

  React.useEffect(() => {
    return auth.events.addAccessTokenExpiring(() => {
      auth.signinSilent();
    });
  }, [auth.events, auth.signinSilent]);

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Logger deg inn...</div>;
    case "signinRedirect": {
      return <div>Logger deg inn...</div>;
    }
    case "signoutRedirect":
      return <div>Logger deg ut...</div>;
    default:
  }

  if (auth.isLoading) {
    return <div>Laster inn...</div>;
  }

  if (auth.error) {
    return (
      <>
        <div>Det oppsto en teknisk feil. Prøv å last siden inn på nytt.</div>
        <div>Ta kontakt med brukerstøtte dersom problemet oppstår gjentatte ganger. {auth.error.message}</div>
      </>
    );
  }
  if (auth.isAuthenticated) {
    loadInitialData();
    return (
      <div className="App">
        <Rammeverk>{children}</Rammeverk>
      </div>
    );
  }
  if (auth.isAuthenticated === false && auth.isLoading === false) {
    auth.signinRedirect();
  }
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
