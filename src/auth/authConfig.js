export const msalConfig = {
  auth: {
    clientId: `${process.env.REACT_APP_AZURE_CLIENT_ID}`,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_APP_TENANT_ID}`,
    redirectUri: "/",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {},
};

export const melosysWebLoginRequest = {
  scopes: [`api://${process.env.REACT_APP_CLUSTER}.teammelosys.${process.env.REACT_APP_AZURE_CLIENT_NAME}/.default`],
};

export const melosysRequest = {
  scopes: [`api://${process.env.REACT_APP_CLUSTER}.teammelosys.${process.env.REACT_APP_MELOSYS_API_APP_NAME}/.default`],
};

export const trygdeavtaleRequest = {
  scopes: [
    `api://${process.env.REACT_APP_CLUSTER}.teammelosys.${process.env.REACT_APP_TRYGDEAVTALE_APP_NAME}/.default`,
  ],
};

export const faktureringskomponentenRequest = {
  scopes: [
    `api://${process.env.REACT_APP_FAKTURERINGSKOMPONENTEN_CLUSTER}.teammelosys.${process.env.REACT_APP_FAKTURERINGSKOMPONENTEN_APP_NAME}/.default`,
  ],
};
