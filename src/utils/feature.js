import * as Api from '../services/api';
import * as Utils from '../utils';

const caseInsensitiveIncludes = (collection, searchElement) =>
  collection.map(el => el.toUpperCase()).includes(searchElement.toUpperCase());

export const featureToggle = (...features) => caseInsensitiveIncludes(features, `${process.env.REACT_APP_FEATURE_TOGGLE}`);

export const namespaceToggle = (...namespaces) => {
  try {
    const { namespace } = Api.ServerInfo.hentServerInfo();
    return caseInsensitiveIncludes(namespaces, namespace || '');
  } catch (e) {
    Utils.logger.error(e);
    return false;
  }
};

export const clusterToggle = (...clusters) => {
  try {
    const { cluster } = Api.ServerInfo.hentServerInfo();
    return caseInsensitiveIncludes(clusters, cluster || '');
  } catch (e) {
    Utils.logger.error(e);
    return false;
  }
};

