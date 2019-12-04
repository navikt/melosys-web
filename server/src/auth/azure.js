import { Issuer, Strategy } from 'openid-client';
import authUtils from './utils';
import config from '../config';
import proxy from '../proxy/corporate-proxy';

const metadata = {
  client_id: config.azureAd.clientId,
  client_secret: config.azureAd.clientSecret,
  redirect_uris: [config.azureAd.redirectUri],
  token_endpoint_auth_method: config.azureAd.tokenEndpointAuthMethod,
};

const client = async () => {
  // see https://github.com/panva/node-openid-client/blob/master/docs/README.md#customizing-individual-http-requests
  proxy.setup(Issuer);
  const issuer = await Issuer.discover(config.azureAd.discoveryUrl);
  proxy.setup(issuer);
  console.log(`Discovered issuer ${issuer.issuer}`);

  const openIdClient = new issuer.Client(metadata);
  proxy.setup(openIdClient);

  return openIdClient;
};

const strategy = client => {
  const verify = (tokenSet, done) => {
    const user = {
      tokenSet,
      claims: tokenSet.claims(),
    };
    return done(null, user);
  };
  const options = {
    client,
    params: {
      response_types: config.azureAd.responseTypes,
      response_mode: config.azureAd.responseMode,
      scope: `openid offline_access ${authUtils.appendDefaultScope(config.azureAd.clientId)}`,
    },
    passReqToCallback: false,
    usePKCE: 'S256',
  };
  return new Strategy(options, verify);
};

export default { client, strategy };
