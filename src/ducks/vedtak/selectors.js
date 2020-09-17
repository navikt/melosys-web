import { createSelector } from 'reselect';

import * as DucksUtils from '../utils';

import { STATUS } from '../../services/utils';

const VedtakSelector = createSelector(
  state => state.vedtak,
  vedtak => vedtak
);

const DataSelector = createSelector(
  VedtakSelector,
  vedtak => vedtak.data
);

const StatusSelector = createSelector(
  VedtakSelector,
  status => status.status
);

export const ErPendingSelector = createSelector(
  StatusSelector,
  status => status === STATUS.PENDING
);

const ResponsDataSelector = createSelector(
  DataSelector,
  data => data.data
);

export const FeilkoderSelector = createSelector(
  ResponsDataSelector,
  StatusSelector,
  DucksUtils.hentFeilkoder
);
