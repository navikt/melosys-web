import { createSelector } from 'reselect';

export const AnmodningsperioderSelector = createSelector(
  state => (state.anmodningsperioder.data ? state.avklartefakta.data : []),
  anmodningsperioder => anmodningsperioder
);

