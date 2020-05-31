/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';
import * as KV from '../../kodeverk';
import * as Utils from '../../utils';

import MKV from '../../melosyskodeverk';

const getFormState = (state, formName, defaultValue = {}) => (
  state.form[formName] ? state.form[formName] : defaultValue
);

export const FormSelector = createSelector(
  state => state,
  state => state.form
);

export const RegisteredFieldsSelector = Utils._memoize(formName => createSelector(
  state => state,
  state => getFormState(state, formName).registeredFields || []
));

export const SoknadenFormSelector = createSelector(
  state => getFormState(state, KV.Form.SOKNAD, {}),
  soknaden => soknaden
);

export const VedtakArtikkel12FormSelector = createSelector(
  state => getFormState(state, KV.Form.ARTIKKEL_12_VEDTAK, {}),
  vedtakForm => vedtakForm
);

export const VedtakArtikkel12FormValuesSelector = createSelector(
  VedtakArtikkel12FormSelector,
  vedtakArtikkel12Form => vedtakArtikkel12Form.values
);

export const VurderUtpekingFormSelector = createSelector(
  state => getFormState(state, KV.Form.VURDER_UTPEKING, {}),
  vurderUtpekingForm => vurderUtpekingForm
);

export const VurderUtpekingFormValuesSelector = createSelector(
  VurderUtpekingFormSelector,
  vurderUtpekingForm => vurderUtpekingForm.values || {}
);

export const VurderUtpekingFomSelector = createSelector(
  VurderUtpekingFormValuesSelector,
  values => values.fom
);

export const VurderUtpekingTomSelector = createSelector(
  VurderUtpekingFormValuesSelector,
  values => values.tom
);

export const VurderUtpekingVurderingSelector = createSelector(
  VurderUtpekingFormValuesSelector,
  values => values.utpekingVurdering
);

export const UtpekingAvvistSelector = createSelector(
  VurderUtpekingVurderingSelector,
  vurdering => vurdering === MKV.Koder.utfallregistreringunntak.IKKE_GODKJENT
);

export const VurderUtpekingValid = createSelector(
  state => VurderUtpekingFormSelector(state).syncErrors || {},
  errors => Utils._isEmpty(errors)
);

export const Artikkel16AnmodningFormSelector = createSelector(
  state => getFormState(state, KV.Form.ARTIKKEL_16_ANMODNING, {}),
  artikkel16Anmodning => artikkel16Anmodning
);

export const Artikkel16MottaSvarFormSelector = createSelector(
  state => getFormState(state, KV.Form.ARTIKKEL_16_MOTTA_SVAR, {}),
  artikkel16MottaSvar => artikkel16MottaSvar
);

export const RegistreringPanelerFormSelector = createSelector(
  state => getFormState(state, KV.Form.REGISTRERING_PANELER, {}),
  soknaden => soknaden
);

export const InngangFormSelector = createSelector(
  state => getFormState(state, KV.Form.INNGANG, {}),
  inngang => inngang
);

export const JournalforingFormSelector = createSelector(
  state => getFormState(state, KV.Form.JOURNALFORING, {}),
  journalforing => journalforing
);

export const ForretningsValideringSelector = createSelector(
  state => (state.form.forretningsValidering ? state.form.forretningsValidering : {}),
  skjemaValidering => skjemaValidering.regler
);

export const BrevBestillingFormSelector = createSelector(
  state => getFormState(state, KV.Form.BREV_BESTILLING, {}),
  brevbestilling => brevbestilling
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
  state => Artikkel16AnmodningFormSelector(state).values,
  skjemaverdier => skjemaverdier.tidligeremedlemskap || []
);

export const UnntakFraBestemmelseSelector = createSelector(
  state => Artikkel16AnmodningFormSelector(state).values,
  skjemaverdier => (skjemaverdier ? skjemaverdier.unntakFraBestemmelse : null)
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

export const Artikkel16MottaSvarSyncErrorsSelector = createSelector(
  state => Artikkel16MottaSvarFormSelector(state).syncErrors,
  errors => errors
);

export const SoknadErrorsSelector = createSelector(
  state => SoknadenFormSelector(state).syncErrors || {},
  errors => errors
);

const finnPanelFeil = errors => {
  const panelerOgFeil = Utils.finnVerdierMedKey(errors, 'panel', true);
  const unikePanelerMedFeilNavn = Utils._uniqBy(panelerOgFeil, 'panel').map(({ panel }) => panel);

  const panelFeil = unikePanelerMedFeilNavn.map(panelNavn => ({
    panel: panelNavn,
    feil: panelerOgFeil
      .map(({ panel, melding }) => (panelNavn === panel ? melding : null))
      .filter(v => v !== null),
  }));

  return panelFeil;
};

export const PanelFeilSelector = createSelector(
  SoknadErrorsSelector,
  soknadErrors => finnPanelFeil(soknadErrors)
);

export const ErAlleMaritimtArbeidNavnUnikeSelector = createSelector(
  MaritimtArbeidSelector,
  maritimtarbeidListe => maritimtarbeidListe.length === [...new Set(maritimtarbeidListe.map(maritimtarbeid => maritimtarbeid.navn))].length
);

export const SoknadOppgittAdresseHusnummerSelector = createSelector(
  state => SoknadenFormSelector(state).values || {},
  soknad => soknad.oppgittAdresseHusnummer
);

export const SoknadOppgittAdresseGatenavnSelector = createSelector(
  state => SoknadenFormSelector(state).values || {},
  soknad => soknad.oppgittAdresseGatenavn
);

export const SoknadOppgittAdresseRegionSelector = createSelector(
  state => SoknadenFormSelector(state).values || {},
  soknad => soknad.oppgittAdresseRegion
);

export const SoknadOppgittAdressePostnummerSelector = createSelector(
  state => SoknadenFormSelector(state).values || {},
  soknad => soknad.oppgittAdressePostnummer
);

export const SoknadOppgittAdressePoststedSelector = createSelector(
  state => SoknadenFormSelector(state).values || {},
  soknad => soknad.oppgittAdressePoststed
);

export const SoknadOppgittAdresseLandSelector = createSelector(
  state => SoknadenFormSelector(state).values || {},
  soknad => soknad.oppgittAdresseLand
);

export const SoknadOppgittAdresseHarVerdierSelector = createSelector(
  SoknadOppgittAdresseHusnummerSelector,
  SoknadOppgittAdresseGatenavnSelector,
  SoknadOppgittAdresseRegionSelector,
  SoknadOppgittAdressePostnummerSelector,
  SoknadOppgittAdressePoststedSelector,
  SoknadOppgittAdresseLandSelector,
  (...felter) => !felter.every(felt => Utils._isNil(felt) || felt === '')
);

export const RegistreringPanelerOppgittAdresseHusnummerSelector = createSelector(
  state => RegistreringPanelerFormSelector(state).values || {},
  soknad => soknad.oppgittAdresseHusnummer
);

export const RegistreringPanelerOppgittAdresseGatenavnSelector = createSelector(
  state => RegistreringPanelerFormSelector(state).values || {},
  soknad => soknad.oppgittAdresseGatenavn
);

export const RegistreringPanelerOppgittAdresseRegionSelector = createSelector(
  state => RegistreringPanelerFormSelector(state).values || {},
  soknad => soknad.oppgittAdresseRegion
);

export const RegistreringPanelerOppgittAdressePostnummerSelector = createSelector(
  state => RegistreringPanelerFormSelector(state).values || {},
  soknad => soknad.oppgittAdressePostnummer
);

export const RegistreringPanelerOppgittAdressePoststedSelector = createSelector(
  state => RegistreringPanelerFormSelector(state).values || {},
  soknad => soknad.oppgittAdressePoststed
);

export const RegistreringPanelerOppgittAdresseLandSelector = createSelector(
  state => RegistreringPanelerFormSelector(state).values || {},
  soknad => soknad.oppgittAdresseLand
);

export const RegistreringPanelerOppgittAdresseHarVerdierSelector = createSelector(
  RegistreringPanelerOppgittAdresseHusnummerSelector,
  RegistreringPanelerOppgittAdresseGatenavnSelector,
  RegistreringPanelerOppgittAdresseRegionSelector,
  RegistreringPanelerOppgittAdressePostnummerSelector,
  RegistreringPanelerOppgittAdressePoststedSelector,
  RegistreringPanelerOppgittAdresseLandSelector,
  (...felter) => !felter.every(felt => Utils._isNil(felt) || felt === '')
);
