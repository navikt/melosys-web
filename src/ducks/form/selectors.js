/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';
import * as KV from '../../kodeverk';
import * as Utils from '../../utils';
import sedBestilling from '../../soknad-komponenter/sideDialog/sedBestilling';

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
  skjemaverdier => skjemaverdier.maritimtArbeid.map(maritimtArbeid => maritimtArbeid.fartsomradeKode) || undefined
);

export const Art16BegrunnelserSelector = createSelector(
  state => SoknadenFormSelector(state).values,
  skjemaverdier => skjemaverdier.vilkar.art16_1_begrunnelser || []
);

export const TidligereMedlemskapSelector = createSelector(
  state => SoknadenFormSelector(state).values,
  skjemaverdier => skjemaverdier.tidligeremedlemskap || []
);

export const UnntakFraBestemmelse = createSelector(
  state => Lovvalgsperiode(state),
  lovvalgsperiode => lovvalgsperiode.unntakFraBestemmelse
);

export const Art16BegrunnelseFritekstSelector = createSelector(
  state => SoknadenFormSelector(state).values,
  skjemaverdier => skjemaverdier.vilkar.art16_1_begrunnelser_fritekst
);

export const MaritimtArbeidSelector = createSelector(
  state => SoknadenFormSelector(state).values,
  skjemaverdier => skjemaverdier.maritimtArbeid
);

export const SokkelEllerSkipSelector = createSelector(
  state => SoknadenFormSelector(state).values,
  skjemaverdier => skjemaverdier.avklartefakta.sokkelEllerSkip
);

export const SoknadErrorsSelector = createSelector(
  state => SoknadenFormSelector(state).syncErrors || {},
  errors => errors
);

const finnPanelerMedFeil = errors => {
  const panelerMedFeil = Object.keys(errors)
    .map(error => errors[error].panel)
    .filter(panel => !Utils._isNil(panel));

  return [...new Set(panelerMedFeil)];
};

export const PanelerMedFeilSelector = createSelector(
  SoknadErrorsSelector,
  soknadErrors => finnPanelerMedFeil(soknadErrors)
);

export const ErAlleMaritimtArbeidNavnUnikeSelector = createSelector(
  MaritimtArbeidSelector,
  maritimtarbeidListe => maritimtarbeidListe.length === [...new Set(maritimtarbeidListe.map(maritimtarbeid => maritimtarbeid.navn))].length
);

