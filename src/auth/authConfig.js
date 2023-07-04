export const msalConfig = {
  auth: {
    clientId: `${import.meta.env.VITE_AZURE_CLIENT_ID}`,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_APP_TENANT_ID}`,
    redirectUri: "/",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {},
};

export const melosysWebLoginRequest = {
  scopes: [`api://${import.meta.env.VITE_CLUSTER}.teammelosys.${import.meta.env.VITE_AZURE_CLIENT_NAME}/.default`],
};

export const melosysRequest = {
  scopes: [`api://${import.meta.env.VITE_CLUSTER}.teammelosys.${import.meta.env.VITE_MELOSYS_API_APP_NAME}/.default`],
};

export const trygdeavtaleRequest = {
  scopes: [`api://${import.meta.env.VITE_CLUSTER}.teammelosys.${import.meta.env.VITE_TRYGDEAVTALE_APP_NAME}/.default`],
};

export const faktureringskomponentenRequest = {
  scopes: [
    `api://${import.meta.env.VITE_FAKTURERINGSKOMPONENTEN_CLUSTER}.teammelosys.${
      import.meta.env.VITE_FAKTURERINGSKOMPONENTEN_APP_NAME
    }/.default`,
  ],
};
