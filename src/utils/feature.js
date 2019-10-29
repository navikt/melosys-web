import * as Api from '../services/api';
import * as Utils from '../utils';

export const toggle = async allowedEnvs => {
  try {
    const { namespace: serverNamespace = '', cluster: serverCluster = '' } = await Api.ServerInfo.hentServerInfo();
    return allowedEnvs.some(({ namespace, cluster }) =>
      namespace.toUpperCase() === serverNamespace.toUpperCase()
      && cluster.toUpperCase() === serverCluster.toUpperCase());
  } catch (e) {
    Utils.logger.error(e);
    return false;
  }
};
