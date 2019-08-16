import { createSelector } from 'reselect';

export const EndrePeriodeSelector = createSelector(
  state => (state.endrePeriode ? state.endrePeriode : {}),
  endrePeriode => endrePeriode
);
