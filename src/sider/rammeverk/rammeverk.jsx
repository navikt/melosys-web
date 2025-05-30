import { useEffect, useState } from "react";
import PT from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { InteractionStatus } from "@azure/msal-browser";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated, useMsal } from "@azure/msal-react";
import Topplinje from "./komponenter/topplinje";
import { melosysWebLoginRequest } from "../../auth/authConfig";
import { getAccessToken, setTokenInterceptor, setTokenInterceptorForLocalDevelopment } from "../../auth/authUtils";
import { featureToggleOperations, featureToggleSelectors } from "../../ducks/featuretoggle";
import { STATUS } from "../../services";

function Hovedside({ isDevelopmentProfile, children }) {
  const { instance, inProgress, accounts } = useMsal();
  const [harToken, setHarToken] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const featureToggleReduxState = useSelector((state) => featureToggleSelectors.FeatureToggleSelector(state));

  const dispatch = useDispatch();

  useEffect(() => {
    if (harToken && featureToggleReduxState.status === STATUS.NOT_STARTED) {
      dispatch(featureToggleOperations.hent());
    }
  }, [harToken]);

  useEffect(() => {
    if (!isDevelopmentProfile && inProgress === InteractionStatus.None && !isAuthenticated) {
      instance.loginRedirect(melosysWebLoginRequest);
    }
  }, [isAuthenticated, instance, inProgress]);

  if (isDevelopmentProfile) {
    setTokenInterceptorForLocalDevelopment().then(() => setHarToken(true));
  } else {
    setTokenInterceptor((url) => getAccessToken(instance, accounts, url), accounts).then(() => setHarToken(true));
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
        Du er ikke logget inn eller din sesjon har utgått. Videresender deg til innlogging-siden.
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
