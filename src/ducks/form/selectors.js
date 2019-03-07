/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';
import * as KV from '../../kodeverk';

const getFormState = (state, formName, defaultValue = {}) => (
  state.form[formName] ? state.form[formName] : defaultValue
);

export const SoknadenFormSelector = createSelector(
  state => getFormState(state, KV.Form.SOKNAD, {}),
  soknaden => soknaden
);

export const JournalforingFormSelector = createSelector(
  state => getFormState(state, KV.Form.JOURNALFORING, {}),
  journalforing => journalforing
);

export const RegistreringFormSelector = createSelector(
  state => getFormState(state, KV.Form.REGISTRERING, {}),
  registrering => registrering
);

export const ForretningsValideringSelector = createSelector(
  state => (state.form.forretningsValidering ? state.form.forretningsValidering : {}),
  skjemaValidering => skjemaValidering.regler
);

export const BrevBestillingFormSelector = createSelector(
  state => getFormState(state, KV.Form.BREV_BESTILLING, {}),
  brevbestilling => brevbestilling
);

export const Lovvalgsperiode = createSelector(
  state => SoknadenFormSelector(state).values,
  skjemaverdier => skjemaverdier.lovvalgsperiode || {}
);

export const FartsomradeKodeSelector = createSelector(
  state => SoknadenFormSelector(state).values,
  skjemaverdier => skjemaverdier.maritimtArbeid[0].fartsomradeKode || undefined
);
