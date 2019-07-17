import { createSelector } from 'reselect';

export const AnmodningsperiodesvarSelector = createSelector(
  state => state.anmodningsperiodesvar.data || {},
  anmodningsperiodesvar => anmodningsperiodesvar
);
