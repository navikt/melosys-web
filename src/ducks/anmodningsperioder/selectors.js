import { createSelector } from "reselect";

export const AnmodningsperioderSelector = createSelector(
  (state) => (state.anmodningsperioder.data ? state.anmodningsperioder.data : []),
  (anmodningsperioder) => anmodningsperioder
);

export const AnmodningsperiodeSelector = createSelector(
  AnmodningsperioderSelector,
  (anmodningsperioder) => anmodningsperioder[0] || {}
);

export const AnmodningsperiodeIDSelector = createSelector(
  AnmodningsperiodeSelector,
  (anmodningsperiode) => anmodningsperiode.id
);

export const UnntakFraBestemmelseSelector = createSelector(
  AnmodningsperiodeSelector,
  (anmodningsperiode) => anmodningsperiode.unntakFraBestemmelse
);

export const TomDatoSelector = createSelector(
  AnmodningsperiodeSelector,
  (anmodningsperiode) => anmodningsperiode.tomDato
);

export const FomDatoSelector = createSelector(
  AnmodningsperiodeSelector,
  (anmodningsperiode) => anmodningsperiode.fomDato
);

export const MedlemskapsperiodeIDSelector = createSelector(
  AnmodningsperiodeSelector,
  (anmodningsperiode) => anmodningsperiode.medlemskapsperiodeID
);

export const AlleAnmodningsperioderSendtUtlandSelector = createSelector(
  AnmodningsperioderSelector,
  (anmodningsperioder) =>
    anmodningsperioder.length > 0 && anmodningsperioder.every((anmodningsperiode) => anmodningsperiode.sendtUtland)
);

export const AnmodningsperioderErSendtUtlandetSelector = createSelector(
  (state) => AnmodningsperioderSelector(state),
  (anmodningsperioder) => anmodningsperioder.some((anmodningsperiode) => anmodningsperiode.sendtUtland)
);
