import React, { useEffect } from "react";
import PT from "prop-types";
import { InteractionStatus } from "@azure/msal-browser";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated, useMsal } from "@azure/msal-react";
import Topplinje from "./komponenter/topplinje";
import { loginRequest } from "../../auth/authConfig";
import { setTokenInterceptor } from "../../services/utils";

function Hovedside({ loadInitialData, children }) {
  const { instance, inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    // console.log(msalConfig);
    if (inProgress === InteractionStatus.None && !isAuthenticated) {
      instance.loginRedirect(loginRequest);
    }
  }, [isAuthenticated, instance, inProgress]);

  const getAccessToken = () => {
    // console.log("Getting there...");
    return instance
      .acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      })
      .then((response) => {
        // console.log(response);
        return response.accessToken;
      })
      .catch((error) => {
        console.log(error);
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
