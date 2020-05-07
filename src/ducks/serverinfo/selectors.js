import { createSelector } from 'reselect';

const namespaces = {
  DEFAULT: 'DEFAULT',
};

const clusters = {
  PROD_FSS: 'PROD-FSS',
  DEV_FSS: 'DEV-FSS',
};

const ServerinfoSelector = createSelector(
  state => state.serverinfo || {},
  serverinfo => serverinfo
);

const ServerinfoDataSelector = createSelector(
  ServerinfoSelector,
  serverinfo => serverinfo.data
);

const NamespaceSelector = createSelector(
  ServerinfoDataSelector,
  serverinfo => serverinfo.namespace
);

const ClusterSelector = createSelector(
  ServerinfoDataSelector,
  serverinfo => serverinfo.cluster
);

export const ErProdishSelector = createSelector(
  NamespaceSelector,
  ClusterSelector,
  (currentNamespace = '', currentCluster = '') => (
    currentNamespace.toUpperCase() === namespaces.DEFAULT &&
    (currentCluster.toUpperCase() === clusters.PROD_FSS || currentCluster.toUpperCase() === clusters.DEV_FSS)
  )
);
