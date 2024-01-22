export const msalConfig = {
  auth: {
    clientId: `${window.env.AZURE_CLIENT_ID}`,
    authority: `https://login.microsoftonline.com/${window.env.AZURE_APP_TENANT_ID}`,
    redirectUri: "/",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {},
};

export const melosysWebLoginRequest = {
  scopes: [`api://${window.env.CLUSTER}.teammelosys.${window.env.AZURE_CLIENT_NAME}/.default`],
};

export const melosysRequest = {
  scopes: [`api://${window.env.CLUSTER}.teammelosys.${window.env.MELOSYS_API_APP_NAME}/.default`],
};

export const trygdeavtaleRequest = {
  scopes: [`api://${window.env.CLUSTER}.teammelosys.${window.env.TRYGDEAVTALE_APP_NAME}/.default`],
};

export const faktureringskomponentenRequest = {
  scopes: [
    `api://${window.env.FAKTURERINGSKOMPONENTEN_CLUSTER}.teammelosys.${window.env.FAKTURERINGSKOMPONENTEN_APP_NAME}/.default`,
  ],
};
