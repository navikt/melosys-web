import { createSelector } from "reselect";

export const AnmodningsperiodesvarSelector = createSelector(
  (state) => state.anmodningsperiodesvar.data || {},
  (anmodningsperiodesvar) => anmodningsperiodesvar,
);

export const ReduxStatusSelector = createSelector(
  (state) => state.anmodningsperiodesvar.status,
  (status) => status,
);

export const EndretPeriodeSelector = createSelector(
  (state) => AnmodningsperiodesvarSelector(state) || {},
  (anmodningsperiodesvar) => anmodningsperiodesvar.endretPeriode,
);

export const EndretPeriodeFomSelector = createSelector(
  (state) => EndretPeriodeSelector(state) || {},
  (periode) => periode.fom,
);

export const EndretPeriodeTomSelector = createSelector(
  (state) => EndretPeriodeSelector(state) || {},
  (periode) => periode.tom,
);

export const BegrunnelseFritekstSelector = createSelector(
  (state) => AnmodningsperiodesvarSelector(state),
  (anmodningsperiodesvar) => anmodningsperiodesvar.begrunnelseFritekst || "",
);

export const AnmodningsperiodeSvarTypeSelector = createSelector(
  (state) => AnmodningsperiodesvarSelector(state),
  (anmodningsperiodesvar) => anmodningsperiodesvar.anmodningsperiodeSvarType,
);
