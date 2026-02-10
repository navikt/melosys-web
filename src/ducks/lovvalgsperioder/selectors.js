/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from "reselect";
import { ValgteLovvalgsVilkar } from "../vilkar/selectors";

// import * as Koder from '../../kodeverk';

// selector(s)
/**
 * @type {import('reselect').Selector<import('../../AppTypes').RootState, import('../types').Lovvalgsperiode[]>}
 */
export const LovvalgsperioderSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => (state.lovvalgsperioder.data ? state.lovvalgsperioder.data : []),
  (lovvalgsperioder) => lovvalgsperioder,
);

export const LovvalgsperiodeSelector = createSelector(
  (state) => LovvalgsperioderSelector(state),
  (lovvalgsPerioder) => (lovvalgsPerioder[0] ? lovvalgsPerioder[0] : {}),
);

export const ValgteLovvalgsVilkarBestemmelseSelector = createSelector(
  (state) => ValgteLovvalgsVilkar(state),
  (lovvalgsvilkar) => (lovvalgsvilkar.length > 0 ? lovvalgsvilkar[0].vilkaar : undefined),
);

export const LovvalgBestemmelseSelector = createSelector(
  LovvalgsperiodeSelector,
  (lovvalgsperiode) => lovvalgsperiode.lovvalgsbestemmelse,
);

export const TilleggBestemmelseSelector = createSelector(
  LovvalgsperiodeSelector,
  (lovvalgsperiode) => lovvalgsperiode.tilleggBestemmelse,
);

export const LovvalgslandSelector = createSelector(
  (state) => LovvalgsperiodeSelector(state),
  (lovvalgsperiode) => lovvalgsperiode.lovvalgsland,
);

export const MedlemskapsperiodeIDSelector = createSelector(
  (state) => LovvalgsperiodeSelector(state),
  (lovvalgsperiode) => lovvalgsperiode.medlemskapsperiodeID,
);

export const LovvalgsperioderStatusSelector = createSelector(
  (state) => state.lovvalgsperioder.status,
  (status) => status,
);

export const PeriodeSelector = createSelector(
  (state) => LovvalgsperiodeSelector(state),
  (lovvalgsperiode) => ({
    fom: lovvalgsperiode.fomDato,
    tom: lovvalgsperiode.tomDato,
  }),
);

export const InnvilgelsesResultatSelector = createSelector(
  LovvalgsperiodeSelector,
  (lovvalgsperiode) => lovvalgsperiode.innvilgelsesResultat,
);
export const FomDatoSelector = createSelector(
  (state) => LovvalgsperiodeSelector(state),
  (lovvalgsperiode) => lovvalgsperiode.fomDato,
);

export const TomDatoSelector = createSelector(
  (state) => LovvalgsperiodeSelector(state),
  (lovvalgsperiode) => lovvalgsperiode.tomDato,
);
