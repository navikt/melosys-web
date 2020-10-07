import { createSelector } from 'reselect';

import { STATUS } from '../../services/utils';

const VedtakSelector = createSelector(
  state => state.vedtak,
  vedtak => vedtak
);

const ReduxStatusSelector = createSelector(
  VedtakSelector,
  vedtak => vedtak.status
);

export const ErPendingSelector = createSelector(
  ReduxStatusSelector,
  status => status === STATUS.PENDING
);
