/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

export const SoknadenFormSelector = createSelector(
  state => (state.form.soknad ? state.form.soknad : {}),
  soknaden => soknaden
);

export const JournalforingFormSelector = createSelector(
  state => (state.form.journalforing ? state.form.journalforing : {}),
  journalforing => journalforing
);

export const ForretningsValideringSelector = createSelector(
  state => (state.form.forretningsValidering ? state.form.forretningsValidering : {}),
  skjemaValidering => skjemaValidering.regler
);

export const MangelBrevFormSelector = createSelector(
  state => (state.form.mangelbrev ? state.form.mangelbrev : {}),
  mangelbrev => mangelbrev
);
