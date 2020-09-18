import { createSelector, Selector } from 'reselect';
import { RootState, StateSection } from 'AppTypes';

import * as Types from './types';
import * as DucksUtils from '../utils';

const VideresendingSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  state => state.videresending,
  videresending => videresending
);

const ReduxStatusSelector = createSelector(
  VideresendingSelector,
  videresending => videresending.status
);

const VideresendingDataSelector = createSelector(
  VideresendingSelector,
  videresending => videresending.data
);

const HttpResponsDataSelector = createSelector(
  VideresendingDataSelector,
  videresendingData => videresendingData.data
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
  DucksUtils.hentFeilmeldingByStateName('videresending')
);

export const FeilkoderSelector = createSelector(
  HttpResponsDataSelector,
  ReduxStatusSelector,
  DucksUtils.hentFeilkoder
);
