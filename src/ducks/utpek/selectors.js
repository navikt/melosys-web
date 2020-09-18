import { createSelector } from 'reselect';

import * as DucksUtils from '../utils';

const UtpekSelector = createSelector(
  state => state.utpek.data,
  utpek => utpek
);

const ReduxStatusSelector = createSelector(
  state => state.utpek.status,
  status => status
);

const ResponsDataSelector = createSelector(
  UtpekSelector,
  data => data.data
);

const HttpResponsDataSelector = createSelector(
  UtpekSelector,
  utpek => utpek.data
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
  DucksUtils.hentFeilmeldingByStateName('utpeking')
);

export const FeilkoderSelector = createSelector(
  ResponsDataSelector,
  ReduxStatusSelector,
  DucksUtils.hentFeilkoder
);
