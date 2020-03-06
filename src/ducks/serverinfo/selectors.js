import { createSelector } from 'reselect';

const namespaces = {
  DEFAULT: 'DEFAULT',
};

const clusters = {
  PROD_FSS: 'PROD-FSS',
};

const ServerinfoSelector = createSelector(
  state => state.serverinfo || {},
  serverinfo => serverinfo
);

const ServerinfoDataSelector = createSelector(
  ServerinfoSelector,
  serverinfo => serverinfo.data
)

const NamespaceSelector = createSelector(
  ServerinfoDataSelector,
  serverinfo => serverinfo.namespace
);

const ClusterSelector = createSelector(
  ServerinfoDataSelector,
  serverinfo => serverinfo.cluster
);

export const ErProdSelector = createSelector(
  NamespaceSelector,
  ClusterSelector,
  (namespace = '', cluster = '') => namespace.toUpperCase() === namespaces.DEFAULT && cluster.toUpperCase() === clusters.PROD_FSS
);
