import { createSelector } from 'reselect';

import { STATUS } from '../../services/utils';

export const VedtakSelector = createSelector(
  state => state.vedtak.data,
  vedtak => vedtak
);

export const StatusSelector = createSelector(
  state => state.vedtak.status,
  status => status
);

export const ErPendingSelector = createSelector(
  StatusSelector,
  status => status === STATUS.PENDING
);

export const FeilkoderSelector = createSelector(
  VedtakSelector,
  StatusSelector,
  (vedtak, status) => {
    if (status === STATUS.ERROR) {
      return vedtak.data.feilkoder;
    }
    return [];
  }
);
