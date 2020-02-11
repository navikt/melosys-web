import { createSelector } from 'reselect';

export const UtpekingsperioderSelector = createSelector(
  state => (state.utpekingsperioder.data ? state.utpekingsperioder.data : []),
  utpekingsperioder => utpekingsperioder
);

export const UtpekingsperiodeSelector = createSelector(
  UtpekingsperioderSelector,
  utpekingsperioder => utpekingsperioder[0] || {}
);

export const LovvalgslandSelector = createSelector(
  UtpekingsperiodeSelector,
  utpekingsperiode => utpekingsperiode.lovvalgsland
);
