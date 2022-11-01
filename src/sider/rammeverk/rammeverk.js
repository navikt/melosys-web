import React, { useEffect } from "react";
import PT from "prop-types";
import { InteractionStatus } from "@azure/msal-browser";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated, useMsal } from "@azure/msal-react";
import Topplinje from "./komponenter/topplinje";
import { melosysRequest, trygdeavtaleRequest } from "../../auth/authConfig";
import { setTokenInterceptor } from "../../services/utils";
import { TRYGDEAVTALE_FLYT_BASE_URL } from "../../services/api-constants";

function Hovedside({ loadInitialData, children }) {
  const { instance, inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (inProgress === InteractionStatus.None && !isAuthenticated) {
      instance.loginRedirect(melosysRequest);
    }
  }, [isAuthenticated, instance, inProgress]);

  const getAccessToken = (url) => {
    return instance
      .acquireTokenSilent({
        ...(url.includes(TRYGDEAVTALE_FLYT_BASE_URL) ? trygdeavtaleRequest : melosysRequest),
        account: accounts[0],
      })
      .then((response) => {
        return response.accessToken;
      })
      .catch((error) => {
        console.log(error); // eslint-disable-line no-console
        return null;
      });
  };

  setTokenInterceptor(getAccessToken, accounts);

  loadInitialData();

  return (
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
  loadInitialData: () => {},
};

Hovedside.propTypes = {
  children: PT.node,
  loadInitialData: PT.func,
};

Hovedside.defaultProps = {
  children: undefined,
  loadInitialData: () => {},
};

export default Hovedside;
