import * as Api from '../services/api';
import * as Utils from '../utils';

const caseInsensitiveIncludes = (collection, searchElement) =>
  collection.map(el => el.toUpperCase()).includes(searchElement.toUpperCase());

export const featureToggle = (...features) => caseInsensitiveIncludes(features, `${process.env.REACT_APP_FEATURE_TOGGLE}`);

export const namespaceToggle = async (...namespaces) => {
  try {
    const { namespace } = await Api.ServerInfo.hentServerInfo();
    return caseInsensitiveIncludes(namespaces, namespace || '');
  } catch (e) {
    Utils.logger.error(e);
    return false;
  }
};

export const clusterToggle = async (...clusters) => {
  try {
    const { cluster } = await Api.ServerInfo.hentServerInfo();
    return caseInsensitiveIncludes(clusters, cluster || '');
  } catch (e) {
    Utils.logger.error(e);
    return false;
  }
};

