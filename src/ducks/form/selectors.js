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

export const BrevBestillingFormSelector = createSelector(
  state => (state.form.brevbestilling ? state.form.brevbestilling : {}),
  brevbestilling => brevbestilling
);

export const Lovvalgsperiode = createSelector(
  state => SoknadenFormSelector(state).values,
  skjemaverdier => skjemaverdier.lovvalgsperiode || {}
);

export const FartsomradeKodeSelector = createSelector(
  state => SoknadenFormSelector(state).values,
  skjemaverdier => skjemaverdier.maritimtArbeid.map(maritimtArbeid => maritimtArbeid.fartsomradeKode) || undefined
);

export const Art16BegrunnelserSelector = createSelector(
  state => SoknadenFormSelector(state).values,
  skjemaverdier => skjemaverdier.vilkar.art16_1_begrunnelser
);

export const TidligereMedlemskapSelector = createSelector(
  state => SoknadenFormSelector(state).values,
  skjemaverdier => skjemaverdier.tidligeremedlemskap || []
);
