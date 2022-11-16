import React, { useEffect } from "react";
import PT from "prop-types";
import { InteractionStatus } from "@azure/msal-browser";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated, useMsal } from "@azure/msal-react";
import Topplinje from "./komponenter/topplinje";
import { melosysRequest } from "../../auth/authConfig";
import { getAccessToken, setTokenInterceptor, setTokenInterceptorForLocalDevelopment } from "../../auth/authUtils";

function Hovedside({ loadInitialData, isDevelopmentProfile, children }) {
  const { instance, inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (!isDevelopmentProfile && inProgress === InteractionStatus.None && !isAuthenticated) {
      instance.loginRedirect(melosysRequest);
    }
  }, [isAuthenticated, instance, inProgress]);

  if (process.env.NODE_ENV === "development") {
    setTokenInterceptorForLocalDevelopment();
  } else {
    setTokenInterceptor((url) => getAccessToken(instance, accounts, url), accounts);
  }

  loadInitialData();

  return isDevelopmentProfile ? (
    <div>
      <Topplinje />
      {children}
    </div>
  ) : (
    <>
      <AuthenticatedTemplate>
        <div>
          <Topplinje />
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
  loadInitialData: () => {},
};

Hovedside.propTypes = {
  children: PT.node,
  loadInitialData: PT.func,
  isDevelopmentProfile: PT.bool,
};

Hovedside.defaultProps = {
  children: undefined,
  loadInitialData: () => {},
  isDevelopmentProfile: false,
};

export default Hovedside;
