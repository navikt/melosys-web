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

export const loginRequest = {
  scopes: ["api://dev-fss.teammelosys.melosys-q1/.default"],
};
