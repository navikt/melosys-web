import config from '../config';

const appendDefaultScope = scope => `${scope}/.default`;

const formatClientIdScopeForV2Clients = clientId => appendDefaultScope(`api://${clientId}`);

const hasExpiredTokenSets = req => req.user && req.user.tokenSet && req.user.tokenSet.expired() === true;

const getOnBehalfOfTokenSet = async (client, accessToken) => client.grant({
  grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
  client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
  requested_token_use: 'on_behalf_of',
  scope: `${formatClientIdScopeForV2Clients(config.downstreamApi.clientId)}`,
  assertion: accessToken,
});

const renewTokenSets = async (client, refreshToken) => client.grant({
  client_id: config.azureAd.clientId,
  client_secret: config.azureAd.clientSecret,
  redirect_uri: config.azureAd.redirectUri,
  grant_type: 'refresh_token',
  refresh_token: refreshToken,
});

export default {
  hasExpiredTokenSets,
  getOnBehalfOfTokenSet,
  renewTokenSets,
  appendDefaultScope,
  formatClientIdScopeForV2Clients,
};
