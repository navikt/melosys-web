import { createSelector } from 'reselect';

import { STATUS } from '../../services/utils';

const UtpekSelector = createSelector(
  state => state.utpek.data,
  utpek => utpek
);

const StatusSelector = createSelector(
  state => state.utpek.status,
  status => status
);

export const FeilkoderSelector = createSelector(
  UtpekSelector,
  StatusSelector,
  (utpek, status) => {
    if (status === STATUS.ERROR) {
      return utpek.data.feilkoder;
    }
    return [];
  }
);
