import { createSelector, Selector } from 'reselect';
import { RootState, StateSection } from 'AppTypes';

import * as DucksUtils from '../utils';
import * as Types from './types';

const AnmodningOmUnntakSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  state => state.anmodningomunntak,
  anmodningOmUnntak => anmodningOmUnntak
);

const ReduxStatusSelector = createSelector(
  AnmodningOmUnntakSelector,
  anmodningOmUnntak => anmodningOmUnntak.status
);

const AnmodningOmUnntakDataSelector = createSelector(
  AnmodningOmUnntakSelector,
  anmodningOmUnntak => anmodningOmUnntak.data
);

const HttpResponsDataSelector = createSelector(
  AnmodningOmUnntakDataSelector,
  anmodningOmUnntakData => anmodningOmUnntakData.data
);

export const FeilkoderSelector = createSelector(
  HttpResponsDataSelector,
  ReduxStatusSelector,
  DucksUtils.hentFeilkoder
);
