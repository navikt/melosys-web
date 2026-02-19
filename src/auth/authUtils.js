import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { TRYGDEAVTALE_FLYT_BASE_URL, FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL } from "../services/api-constants";
import { faktureringskomponentenRequest, melosysRequest, trygdeavtaleRequest } from "./authConfig";

const originalFetch = window.fetch;

export const setTokenInterceptor = async (getAccessToken, accounts) => {
  window.fetch = async (...args) => {
    const [url, options = {}] = args;
    if (!options.headers) {
      options.headers = {};
    }
    if (accounts[0] !== undefined && !url.includes("microsoft")) {
      const accessToken = await getAccessToken(url);
      if (options.headers instanceof Headers) {
        options.headers.append("Authorization", `Bearer ${accessToken}`);
      } else {
        options.headers = { ...options.headers, Authorization: `Bearer ${accessToken}` };
      }
    }
    return originalFetch(url, options);
  };
};

export const setTokenInterceptorForLocalDevelopment = async () => {
  window.fetch = async (...args) => {
    const [url, options = {}] = args;
    if (!options.headers) {
      options.headers = {};
    }

    const accessToken = window.env.LOCAL_AUTH_TOKEN;
    if (options.headers instanceof Headers) {
      options.headers.append("Authorization", `Bearer ${accessToken}`);
    } else {
      options.headers = { ...options.headers, Authorization: `Bearer ${accessToken}` };
    }

    return originalFetch(url, options);
  };
};

const tokenScopeMapper = (url) => {
  if (url.startsWith(TRYGDEAVTALE_FLYT_BASE_URL)) return trygdeavtaleRequest;
  if (url.startsWith(FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL)) return faktureringskomponentenRequest;

  return melosysRequest;
};

export const getAccessToken = (msalInstance, accounts, url, acquireTokenRedirect = false) => {
  const request = tokenScopeMapper(url);

  return msalInstance[acquireTokenRedirect ? "acquireTokenRedirect" : "acquireTokenSilent"]({
    ...request,
    account: accounts[0],
  })
    .then((response) => {
      return response.accessToken;
    })
    .catch((error) => {
      if (error instanceof InteractionRequiredAuthError) {
        return getAccessToken(msalInstance, accounts, url, true);
      }

      /* eslint-disable-next-line no-console */
      console.log(error);
      return null;
    });
};
