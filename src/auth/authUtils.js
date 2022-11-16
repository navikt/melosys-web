import { TRYGDEAVTALE_FLYT_BASE_URL } from "../services/api-constants";
import { melosysRequest, trygdeavtaleRequest } from "./authConfig";

const originalFetch = window.fetch;

export const setTokenInterceptor = (getAccessToken, accounts) => {
  window.fetch = async (...args) => {
    const [url, options] = args;
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

export const setTokenInterceptorForLocalDevelopment = () => {
  if (process.env.NODE_ENV === "development") {
    window.fetch = async (...args) => {
      const [url, options] = args;
      if (!options.headers) {
        options.headers = {};
      }

      const accessToken = process.env.REACT_APP_LOCAL_AUTH_TOKEN;
      if (options.headers instanceof Headers) {
        options.headers.append("Authorization", `Bearer ${accessToken}`);
      } else {
        options.headers = { ...options.headers, Authorization: `Bearer ${accessToken}` };
      }

      return originalFetch(url, options);
    };
  }
};

export const getAccessToken = (instance, accounts, url) => {
  return instance
    .acquireTokenSilent({
      ...(url.startsWith(TRYGDEAVTALE_FLYT_BASE_URL) ? trygdeavtaleRequest : melosysRequest),
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
