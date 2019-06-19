import { createSelector } from 'reselect';

export const AnmodningsperioderSelector = createSelector(
  state => (state.anmodningsperioder.data ? state.anmodningsperioder.data : []),
  anmodningsperioder => anmodningsperioder
);

