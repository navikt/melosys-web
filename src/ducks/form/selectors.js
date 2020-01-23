/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';
import * as KV from '../../kodeverk';
import * as Utils from '../../utils';

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

export const Artikkel16AnmodningFormSelector = createSelector(
  state => getFormState(state, KV.Form.ARTIKKEL_16_ANMODNING, {}),
  artikkel16Anmodning => artikkel16Anmodning
);

export const Artikkel16MottaSvarFormSelector = createSelector(
  state => getFormState(state, KV.Form.ARTIKKEL_16_MOTTA_SVAR, {}),
  artikkel16MottaSvar => artikkel16MottaSvar
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

const finnPanelerMedFeil = errors => {
  const panelerMedFeil = Utils.finnVerdierMedKey(errors, 'panel');
  const unikePaneler = [...new Set(panelerMedFeil)];

  return unikePaneler;
};

export const PanelerMedFeilSelector = createSelector(
  SoknadErrorsSelector,
  soknadErrors => finnPanelerMedFeil(soknadErrors)
);

export const ErAlleMaritimtArbeidNavnUnikeSelector = createSelector(
  MaritimtArbeidSelector,
  maritimtarbeidListe => maritimtarbeidListe.length === [...new Set(maritimtarbeidListe.map(maritimtarbeid => maritimtarbeid.navn))].length
);

export const OppgittAdresseHusnummerSelector = createSelector(
  state => SoknadenFormSelector(state).values || {},
  soknad => soknad.oppgittAdresseHusnummer
);

export const OppgittAdresseGatenavnSelector = createSelector(
  state => SoknadenFormSelector(state).values || {},
  soknad => soknad.oppgittAdresseGatenavn
);

export const OppgittAdresseRegionSelector = createSelector(
  state => SoknadenFormSelector(state).values || {},
  soknad => soknad.oppgittAdresseRegion
);

export const OppgittAdressePostnummerSelector = createSelector(
  state => SoknadenFormSelector(state).values || {},
  soknad => soknad.oppgittAdressePostnummer
);

export const OppgittAdressePoststedSelector = createSelector(
  state => SoknadenFormSelector(state).values || {},
  soknad => soknad.oppgittAdressePoststed
);

export const OppgittAdresseLandSelector = createSelector(
  state => SoknadenFormSelector(state).values || {},
  soknad => soknad.oppgittAdresseLand
);

export const OppgittAdresseHarVerdierSelector = createSelector(
  OppgittAdresseHusnummerSelector,
  OppgittAdresseGatenavnSelector,
  OppgittAdresseRegionSelector,
  OppgittAdressePostnummerSelector,
  OppgittAdressePoststedSelector,
  OppgittAdresseLandSelector,
  (...felter) => !felter.every(felt => Utils._isNil(felt) || felt === '')
);
