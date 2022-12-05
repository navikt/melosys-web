import React, { useEffect } from "react";
import PT from "prop-types";
import { InteractionStatus } from "@azure/msal-browser";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated, useMsal } from "@azure/msal-react";
import Topplinje from "./komponenter/topplinje";
import { melosysRequest } from "../../auth/authConfig";
import { getAccessToken, setTokenInterceptor, setTokenInterceptorForLocalDevelopment } from "../../auth/authUtils";

function Hovedside({ isDevelopmentProfile, children }) {
  const { instance, inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (!isDevelopmentProfile && inProgress === InteractionStatus.None && !isAuthenticated) {
      instance.loginRedirect(melosysRequest);
    }
  }, [isAuthenticated, instance, inProgress]);

  if (isDevelopmentProfile) {
    setTokenInterceptorForLocalDevelopment();
  } else {
    setTokenInterceptor((url) => getAccessToken(instance, accounts, url), accounts);
  }

  return isDevelopmentProfile ? (
    <div>
      <Topplinje saksbehandler="Lokal Testbruker" />
      {children}
    </div>
  ) : (
    <>
      <AuthenticatedTemplate>
        <div>
          <Topplinje saksbehandler={accounts && accounts.length > 0 ? accounts[0].name : ""} />
          {children}
        </div>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <div className="pb-4" />
        Du er ikke logget inn eller din sesjon har utgått. Videresender deg til innlogginggssiden.
      </UnauthenticatedTemplate>
    </>
  );
}

Hovedside.defaultProps = {
  children: null,
  isDevelopmentProfile: false,
};

Hovedside.propTypes = {
  children: PT.node,
  isDevelopmentProfile: PT.bool,
};

Hovedside.defaultProps = {
  children: undefined,
  isDevelopmentProfile: false,
};

export default Hovedside;
