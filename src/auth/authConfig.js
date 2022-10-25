export const msalConfig = {
  auth: {
    clientId: `${process.env.REACT_APP_AZURE_CLIENT_ID}`,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_APP_TENANT_ID}`,
    redirectUri: "/",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {},
};

// TODO: Legg til trygdeavtale scope, fjern hardkodet scope melosys,
export const loginRequest = {
  scopes: ["api://dev-fss.teammelosys.melosys-q1/.default"],
};
