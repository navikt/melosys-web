export const msalConfig = {
  auth: {
    clientId: "f80f641c-4ba5-4723-9578-a985add25e05",
    // authority: "http://host.docker.internal:8082/isso/.well-known/openid-configuration", // `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_APP_TENANT_ID}`, REACT_APP_AZURE_APP_TENANT_ID=966ac572-f5b7-4bbe-aa88-c76419c0f851
    authority: "https://login.microsoftonline.com/966ac572-f5b7-4bbe-aa88-c76419c0f851",
    redirectUri: "/",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {},
};

export const loginRequest = {
  scopes: ["api://dev-gcp.teammelosys.melosys-trygdeavgift/.default"], // "openid_profile", // [process.env.REACT_APP_MELOSYS_TRYGDEAVGIFT_AZURE_APP_UD_URI + "/.default"],
};
