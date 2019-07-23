import { createSelector } from 'reselect';

export const AnmodningsperioderSelector = createSelector(
  state => (state.anmodningsperioder.data ? state.anmodningsperioder.data : []),
  anmodningsperioder => anmodningsperioder
);

export const AnmodningsperiodeSelector = createSelector(
  AnmodningsperioderSelector,
  anmodningsperioder => anmodningsperioder[0] || {}
);

export const AnmodningsperiodeIDSelector = createSelector(
  AnmodningsperiodeSelector,
  anmodningsperiode => anmodningsperiode.id
);

export const UnntakFraBestemmelseSelector = createSelector(
  AnmodningsperiodeSelector,
  anmodningsperiode => anmodningsperiode.unntakFraBestemmelse
);
