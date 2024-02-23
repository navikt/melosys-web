/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from "reselect";
import * as KV from "../../kodeverk";
import * as Utils from "../../utils";

import MKV from "../../melosyskodeverk";
import soknadSchema from "./soknadSchema";
import { lagYupToReduxformErrorMapper } from "../../yup";

import { behandlingerSelectors } from "../behandlinger";
import { MottatteOpplysningerTypeSelector } from "../mottatteOpplysninger/selectors";
import { fagsakSelectors } from "../fagsaker";
import { flytSelectors } from "../flyt";

const getFormState = (state, formName, defaultValue = {}) =>
  state.form[formName] ? state.form[formName] : defaultValue;

export const RegisteredFieldsSelector = Utils._memoize((formName) =>
  createSelector(
    (state) => state,
    (state) => getFormState(state, formName).registeredFields || []
  )
);

export const OpprettNySakFormValuesSelector = createSelector(
  (state) => getFormState(state, KV.Form.OPPRETT_NY_SAK, {}),
  (opprett_ny_sak) => opprett_ny_sak.values
);

export const SoknadFormSelector = createSelector(
  (state) => getFormState(state, KV.Form.SOKNAD, {}),
  (soknadForm) => soknadForm
);

export const SoknadFormValuesSelector = createSelector(SoknadFormSelector, (soknadForm) => soknadForm.values);

export const VedtakArtikkel12FormSelector = createSelector(
  (state) => getFormState(state, KV.Form.ARTIKKEL_12_VEDTAK, {}),
  (vedtakForm) => vedtakForm
);

export const VedtakArtikkel12FormValuesSelector = createSelector(
  VedtakArtikkel12FormSelector,
  (vedtakArtikkel12Form) => vedtakArtikkel12Form.values
);

export const VurderUtpekingFormSelector = createSelector(
  (state) => getFormState(state, KV.Form.VURDER_UTPEKING, {}),
  (vurderUtpekingForm) => vurderUtpekingForm
);

export const VurderUtpekingFormValuesSelector = createSelector(
  VurderUtpekingFormSelector,
  (vurderUtpekingForm) => vurderUtpekingForm.values || {}
);

export const VurderUtpekingFomSelector = createSelector(VurderUtpekingFormValuesSelector, (values) => values.fom);

export const VurderUtpekingTomSelector = createSelector(VurderUtpekingFormValuesSelector, (values) => values.tom);

export const VurderUtpekingVurderingSelector = createSelector(
  VurderUtpekingFormValuesSelector,
  (values) => values.utpekingVurdering
);

export const UtpekingAvvistSelector = createSelector(
  VurderUtpekingVurderingSelector,
  (vurdering) => vurdering === MKV.Koder.utfallregistreringunntak.IKKE_GODKJENT
);

export const VurderUtpekingValid = createSelector(
  (state) => VurderUtpekingFormSelector(state).syncErrors || {},
  (errors) => Utils._isEmpty(errors)
);

export const Artikkel16AnmodningFormSelector = createSelector(
  (state) => getFormState(state, KV.Form.ARTIKKEL_16_ANMODNING, {}),
  (artikkel16Anmodning) => artikkel16Anmodning
);

export const Artikkel16MottaSvarFormSelector = createSelector(
  (state) => getFormState(state, KV.Form.ARTIKKEL_16_MOTTA_SVAR, {}),
  (artikkel16MottaSvar) => artikkel16MottaSvar
);

export const JournalforingFormSelector = createSelector(
  (state) => getFormState(state, KV.Form.JOURNALFORING, {}),
  (journalforing) => journalforing
);

export const SendBrevFormSelector = createSelector(
  (state) => getFormState(state, KV.Form.SEND_BREV, {}),
  (sendbrev) => sendbrev
);

export const SendBrevValidSelector = createSelector(
  (state) => SendBrevFormSelector(state).syncErrors || {},
  (errors) => Utils._isEmpty(errors)
);

export const SendBrevOrgnummerValidSelector = createSelector(
  (state) => SendBrevFormSelector(state).syncErrors || {},
  (errors) => !errors?.organisasjonsnummer
);

export const MaritimtArbeidSelector = createSelector(
  (state) => SoknadFormSelector(state).values,
  (skjemaverdier) => [...skjemaverdier.arbeidsstedOffshore, ...skjemaverdier.arbeidsstedSkip]
);

export const Artikkel16MottaSvarSyncErrorsSelector = createSelector(
  (state) => Artikkel16MottaSvarFormSelector(state).syncErrors,
  (errors) => errors
);

export const SoknadOppgittAdresseSelector = createSelector(
  (state) => SoknadFormSelector(state).values || {},
  (soknad) => ({
    husnummerEtasjeLeilighet: soknad.oppgittAdresseHusnummerEtasjeLeilighet,
    gatenavn: soknad.oppgittAdresseGatenavn,
    region: soknad.oppgittAdresseRegion,
    postnummer: soknad.oppgittAdressePostnummer,
    poststed: soknad.oppgittAdressePoststed,
    landkode: soknad.oppgittAdresseLand,
    tilleggsnavn: soknad.oppgittAdresseTilleggsnavn,
    postboks: soknad.oppgittAdressePostboks,
    coAdressenavn: soknad.coAdressenavn,
  })
);

export const SoknadOppgittAdresseHarVerdierSelector = createSelector(
  (state) => SoknadOppgittAdresseSelector(state),
  (oppgittadresse) => !Object.values(oppgittadresse).every((felt) => Utils._isNil(felt) || felt === "")
);

export const SoknadErrorsSelector = createSelector(
  (state) => SoknadFormSelector(state).syncErrors || {},
  (state) => SoknadFormSelector(state).values || {},
  (state) => ({
    skalOppgittAdresseValideres: SoknadOppgittAdresseHarVerdierSelector(state),
    harUnntaksregistreringFlyt: flytSelectors.HarUnntaksregistreringFlytSelector(state),
    behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
    mottatteOpplysningerType: MottatteOpplysningerTypeSelector(state),
    sakstype: fagsakSelectors.SakstypeKodeSelector(state),
  }),
  (soknadformSyncErrors, soknadformValues, context) => {
    const settings = {
      context,
    };
    /* syncErrors forsvinner fra redux-form state når et felt ikke blir rendret lenger(dette skjer når man er ferdig
    med å editere et EditerbartElement). Dette forårsaket at valideringer av menypunkter ikke dukket opp.
    Validerer derfor formValues her og merger med syncErrors. */
    const soknadformErrors = lagYupToReduxformErrorMapper(soknadSchema, settings)(soknadformValues);

    return Utils._merge(soknadformErrors, soknadformSyncErrors);
  }
);

const finnPanelFeil = (errors) => {
  const panelerOgFeil = Utils.finnVerdierMedKey(errors, "panel", true);
  const unikePanelerMedFeilNavn = Utils._uniqBy(panelerOgFeil, "panel").map(({ panel }) => panel);

  const panelFeil = unikePanelerMedFeilNavn.map((panelNavn) => ({
    panel: panelNavn,
    feil: panelerOgFeil
      .map(({ panel, undertittel, melding }) => {
        if (panelNavn === panel) {
          return undertittel ? `${undertittel} - ${melding}` : melding;
        }
        return null;
      })
      .filter((v) => v !== null),
  }));

  return panelFeil;
};

export const PanelFeilSelector = createSelector(SoknadErrorsSelector, (soknadErrors) => finnPanelFeil(soknadErrors));

/* Trygdeavtale-selectors start */
export const TrygdeavtaleInngangFormSelector = createSelector(
  (state) => getFormState(state, KV.Form.Trygdeavtale.INNGANG, {}),
  (inngang) => inngang
);

export const TrygdeavtaleInngangFormValidSelector = createSelector(
  (state) => TrygdeavtaleInngangFormSelector(state).syncErrors || {},
  (errors) => Utils._isEmpty(errors)
);

export const TrygdeavtaleAvklarVirksomhetFormSelector = createSelector(
  (state) => getFormState(state, KV.Form.Trygdeavtale.AVKLAR_VIRKSOMHET, {}),
  (avklarVirksomhet) => avklarVirksomhet
);

export const TrygdeavtaleAvklarVirksomhetFormValidSelector = createSelector(
  (state) => TrygdeavtaleAvklarVirksomhetFormSelector(state).syncErrors || {},
  (errors) => Utils._isEmpty(errors)
);

export const TrygdeavtaleBestemmelseFormSelector = createSelector(
  (state) => getFormState(state, KV.Form.Trygdeavtale.BESTEMMELSE, {}),
  (bestemmelse) => bestemmelse
);

export const TrygdeavtaleBestemmelseFormValidSelector = createSelector(
  (state) => TrygdeavtaleBestemmelseFormSelector(state).syncErrors || {},
  (errors) => Utils._isEmpty(errors)
);

export const TrygdeavtaleFamileFormSelector = createSelector(
  (state) => getFormState(state, KV.Form.Trygdeavtale.FAMILIE, {}),
  (familie) => familie
);

export const TrygdeavtaleFamilieFormValidSelector = createSelector(
  (state) => TrygdeavtaleFamileFormSelector(state).syncErrors || {},
  (errors) => Utils._isEmpty(errors)
);

export const TrygdeavtaleVedtakFormSelector = createSelector(
  (state) => getFormState(state, KV.Form.Trygdeavtale.VEDTAK, {}),
  (vedtak) => vedtak
);

export const TrygdeavtaleVedtakFormValidSelector = createSelector(
  (state) => TrygdeavtaleVedtakFormSelector(state).syncErrors || {},
  (errors) => Utils._isEmpty(errors)
);

export const TrygdeavtaleVedtakFormPeriodeValidSelector = createSelector(
  (state) => TrygdeavtaleVedtakFormSelector(state).syncErrors || {},
  (errors) => Utils._isEmpty(errors.lovvalgsperiodeFom) && Utils._isEmpty(errors.lovvalgsperiodeTom)
);
/* Trygdeavtale-selectors slutt */
