import 'dotenv/config';

const server = {
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 3000,
  proxy: process.env.HTTP_PROXY,
};

const azureAd = {
  discoveryUrl: process.env.AAD_DISCOVERY_URL,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.AAD_REDIRECT_URL,
  tokenEndpointAuthMethod: 'client_secret_post',
  responseTypes: ['code'],
  responseMode: 'form_post',
};

const downstreamApi = {
  clientId: process.env.DOWNSTREAM_API_CLIENT_ID,
  prefix: process.env.DOWNSTREAM_API_PREFIX || 'downstream',
  host: process.env.DOWNSTREAM_API_HOST,
};

export default { server, azureAd, downstreamApi };
