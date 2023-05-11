import { useContext, useEffect } from "react";
import PT from "prop-types";
import { InteractionStatus } from "@azure/msal-browser";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated, useMsal } from "@azure/msal-react";
import Topplinje from "./komponenter/topplinje";
import { melosysWebLoginRequest } from "../../auth/authConfig";
import { getAccessToken, setTokenInterceptor, setTokenInterceptorForLocalDevelopment } from "../../auth/authUtils";
import { hentAlleFeatureToggles } from "../../featuretoggle/useFeatureToggle";
import { FeatureToggleContext } from "../../contexts/featureToggleContext";

function Hovedside({ isDevelopmentProfile, children }) {
  const { instance, inProgress, accounts } = useMsal();
  const { erInvalidert, validerFeatureTokens } = useContext(FeatureToggleContext);
  const isAuthenticated = useIsAuthenticated();

  const hentAlleFeatureTogglesOgValider = () => {
    hentAlleFeatureToggles();
    validerFeatureTokens();
  };

  useEffect(() => {
    if (erInvalidert) {
      hentAlleFeatureTogglesOgValider();
    }
  }, [erInvalidert]);

  useEffect(() => {
    if (!isDevelopmentProfile && inProgress === InteractionStatus.None && !isAuthenticated) {
      instance.loginRedirect(melosysWebLoginRequest);
    }
  }, [isAuthenticated, instance, inProgress]);

  if (isDevelopmentProfile) {
    setTokenInterceptorForLocalDevelopment().then(() => hentAlleFeatureTogglesOgValider());
  } else {
    setTokenInterceptor((url) => getAccessToken(instance, accounts, url), accounts).then(() =>
      hentAlleFeatureTogglesOgValider()
    );
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
