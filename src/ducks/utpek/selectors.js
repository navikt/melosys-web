import { createSelector } from 'reselect';

import * as DucksUtils from '../utils';

const UtpekSelector = createSelector(
  state => state.utpek.data,
  utpek => utpek
);

const StatusSelector = createSelector(
  state => state.utpek.status,
  status => status
);

const ResponsDataSelector = createSelector(
  UtpekSelector,
  data => data.data
);

export const FeilkoderSelector = createSelector(
  ResponsDataSelector,
  StatusSelector,
  DucksUtils.hentFeilkoder
);
