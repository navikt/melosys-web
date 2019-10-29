import * as Api from '../services/api';

export const toggle = async allowedEnvs => {
  const { namespace: serverNamespace = '', cluster: serverCluster = '' } = await Api.ServerInfo.hentServerInfo();
  return allowedEnvs.some(({ namespace, cluster }) =>
    namespace.toUpperCase() === serverNamespace.toUpperCase()
    && cluster.toUpperCase() === serverCluster.toUpperCase());
};
