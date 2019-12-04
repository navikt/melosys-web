import { custom } from 'openid-client';
import tunnel from 'tunnel';

import config from '../config';

const agent = proxyUri => {
  if (proxyUri) {
    const hostPort = proxyUri
      .replace('https://', '')
      .replace('http://', '')
      .split(':', 2);
    return tunnel.httpsOverHttp({
      proxy: {
        host: hostPort[0],
        port: hostPort[1],
      },
    });
  }
  return null;
};

const setup = object => {
  const proxyUri = config.server.proxy;
  const proxyAgent = agent(proxyUri);
  if (proxyAgent) {
    console.log(`Proxying requests via ${proxyUri} for '${object.constructor.name}'`);
    object[custom.http_options] = options => {
      options.agent = proxyAgent;
      return options;
    };
  } else {
    console.log(`Environment variable HTTP_PROXY is not set, not proxying requests for '${object.constructor.name}'`);
  }
};

export default { setup };
