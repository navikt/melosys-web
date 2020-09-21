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

const ReduxStatusSelector = createSelector(
  VedtakSelector,
  vedtak => vedtak.status
);

export const ErPendingSelector = createSelector(
  ReduxStatusSelector,
  status => status === STATUS.PENDING
);

const HttpResponsDataSelector = createSelector(
  DataSelector,
  data => data.data
);

const HttpStatusSelector = createSelector(
  HttpResponsDataSelector,
  httpResponsData => httpResponsData && httpResponsData.status
);

const HttpMessageSelector = createSelector(
  HttpResponsDataSelector,
  httpResponsData => httpResponsData && httpResponsData.message
);

export const FeilmeldingSelector = createSelector(
  ReduxStatusSelector,
  HttpStatusSelector,
  HttpMessageSelector,
  DucksUtils.hentFeilmelding
);

export const FeilkoderSelector = createSelector(
  HttpResponsDataSelector,
  ReduxStatusSelector,
  DucksUtils.hentFeilkoder
);
