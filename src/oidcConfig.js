import { WebStorageStateStore } from "oidc-client-ts";

export const oidcConfig = {
  authority: `${process.env.REACT_APP_AUTHORITY_URL}`,
  client_id: `${process.env.REACT_APP_AUTHORITY_CLIENT_ID}`,
  redirect_uri: `https://${window.location.host}${process.env.REACT_APP_REDIRECT_PATH}`,
  response_type: "code",
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
  userStore: new WebStorageStateStore({
    store: localStorage,
  }),
};
