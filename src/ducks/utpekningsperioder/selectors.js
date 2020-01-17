import { createSelector } from 'reselect';

export const UtpekningsperioderSelector = createSelector(
  state => (state.utpekningsperioder.data ? state.utpekningsperioder.data : []),
  utpekningsperioder => utpekningsperioder
);

export const UtpekningsperiodeSelector = createSelector(
  UtpekningsperioderSelector,
  utpekningsperioder => utpekningsperioder[0] || {}
);

export const LovvalgslandSelector = createSelector(
  UtpekningsperiodeSelector,
  utpekningsperiode => utpekningsperiode.lovvalgsland
);
