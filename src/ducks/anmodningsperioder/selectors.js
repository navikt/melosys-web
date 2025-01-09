import { createSelector } from "reselect";

export const AnmodningsperioderSelector = createSelector(
  (state) => (state.anmodningsperioder.data ? state.anmodningsperioder.data : []),
  (anmodningsperioder) => anmodningsperioder,
);

export const AnmodningsperiodeSelector = createSelector(
  (state) => AnmodningsperioderSelector(state),
  (anmodningsperioder) => anmodningsperioder[0] || {},
);

export const AnmodningsperiodeIDSelector = createSelector(
  AnmodningsperiodeSelector,
  (anmodningsperiode) => anmodningsperiode.id,
);

export const LovvalgsbestemmelseSelector = createSelector(
  (state) => AnmodningsperiodeSelector(state),
  (anmodningsperiode) => anmodningsperiode.lovvalgBestemmelse,
);

export const TilleggsbestemmelseSelector = createSelector(
  AnmodningsperiodeSelector,
  (anmodningsperiode) => anmodningsperiode.tilleggBestemmelse,
);

export const UnntakFraBestemmelseSelector = createSelector(
  AnmodningsperiodeSelector,
  (anmodningsperiode) => anmodningsperiode.unntakFraBestemmelse,
);

export const TomDatoSelector = createSelector(
  (state) => AnmodningsperiodeSelector(state),
  (anmodningsperiode) => anmodningsperiode.tomDato,
);

export const FomDatoSelector = createSelector(
  (state) => AnmodningsperiodeSelector(state),
  (anmodningsperiode) => anmodningsperiode.fomDato,
);

export const AlleAnmodningsperioderSendtUtlandSelector = createSelector(
  AnmodningsperioderSelector,
  (anmodningsperioder) =>
    anmodningsperioder.length > 0 && anmodningsperioder.every((anmodningsperiode) => anmodningsperiode.sendtUtland),
);

export const AnmodningsperioderErSendtUtlandetSelector = createSelector(
  (state) => AnmodningsperioderSelector(state),
  (anmodningsperioder) => anmodningsperioder.some((anmodningsperiode) => anmodningsperiode.sendtUtland),
);
