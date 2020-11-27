import { RootState, StateSection } from 'AppTypes';
import { createSelector, Selector } from 'reselect';
import * as Types from './types';

export const MedlemskapsperioderSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  state => state.medlemskapsperioder,
  medlemskapsperioder => medlemskapsperioder
);

export const MedlemskapsperioderDataSelector: Selector<RootState, Types.Data> = createSelector(
  MedlemskapsperioderSelector,
  medlemskapsperioder => medlemskapsperioder.data
);
