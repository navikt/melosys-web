export const msalConfig = {
  auth: {
    clientId: `${window.env.VITE_AZURE_CLIENT_ID}`,
    authority: `https://login.microsoftonline.com/${window.env.VITE_AZURE_APP_TENANT_ID}`,
    redirectUri: "/",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {},
};

export const melosysWebLoginRequest = {
  scopes: [`api://${window.env.VITE_CLUSTER}.teammelosys.${window.env.VITE_AZURE_CLIENT_NAME}/.default`],
};

export const melosysRequest = {
  scopes: [`api://${window.env.VITE_CLUSTER}.teammelosys.${window.env.VITE_MELOSYS_API_APP_NAME}/.default`],
};

export const trygdeavtaleRequest = {
  scopes: [`api://${window.env.VITE_CLUSTER}.teammelosys.${window.env.VITE_TRYGDEAVTALE_APP_NAME}/.default`],
};

export const faktureringskomponentenRequest = {
  scopes: [
    `api://${window.env.VITE_FAKTURERINGSKOMPONENTEN_CLUSTER}.teammelosys.${window.env.VITE_FAKTURERINGSKOMPONENTEN_APP_NAME}/.default`,
  ],
};
