import MKV from "../../melosyskodeverk";

import { avklartefaktaOperations } from "../avklartefakta";
import { fagsakOperations, fagsakSelectors } from "../fagsaker";
import { behandlingerOperations, behandlingerSelectors } from "../behandlinger";
import { behandlingsresultatOperations } from "../behandlingsresultat";
import { mottatteOpplysningerOperations } from "../mottatteOpplysninger";
import { lovvalgsperioderOperations } from "../lovvalgsperioder";
import { vilkarOperations } from "../vilkar";
import { behandlingsperioderOperations } from "../behandlingsperioder";
import { anmodningsperioderOperations, anmodningsperioderSelectors } from "../anmodningsperioder";
import { anmodningsperiodesvarOperations } from "../anmodningsperiodesvar";
import { utpekingsperioderOperations } from "../utpekingsperioder";
import { dokumenterOperations } from "../dokumenter";
import { oppsummertfaktaOperations } from "../oppsummertfakta";
import { medlemskapsperioderOperations } from "../medlemskapsperioder";
import { erFeatureToggleEnabled } from "../../featuretoggle";
// noinspection ES6PreferShortImport
import { harUnntakFlyt, skalViseTomFlyt } from "../../routing/url";
import {
  MELOSYS_FOLKETRYGDEN_MVP,
  MELOSYS_IKKEYRKESAKTIV_FORENKLETFLYT,
  MELOSYS_REGISTRERING_UNNTAK_FRA_MEDLEMSKAP,
} from "../../featuretoggle/toggleNavn";

const harTomFlyt = async (sakstype, state) => {
  const sakstema = fagsakSelectors.SakstemaKodeSelector(state);
  const behandlingstema = behandlingerSelectors.BehandlingstemaKodeSelector(state);
  const behandlingstype = behandlingerSelectors.BehandlingstypeKodeSelector(state);
  const folketrygdenToggleEnabled = erFeatureToggleEnabled(MELOSYS_FOLKETRYGDEN_MVP, state);
  const ikkeYrkesaktivFlytToggleEnabled = erFeatureToggleEnabled(MELOSYS_IKKEYRKESAKTIV_FORENKLETFLYT, state);
  const registreringUnntakFraMedlemskapToggleEnabled = erFeatureToggleEnabled(
    MELOSYS_REGISTRERING_UNNTAK_FRA_MEDLEMSKAP,
    state
  );

  return skalViseTomFlyt(
    sakstype,
    sakstema,
    behandlingstema,
    behandlingstype,
    folketrygdenToggleEnabled,
    ikkeYrkesaktivFlytToggleEnabled,
    registreringUnntakFraMedlemskapToggleEnabled
  );
};
const harUnntaksregistreringFlyt = async (sakstype, state) => {
  const sakstema = fagsakSelectors.SakstemaKodeSelector(state);
  const behandlingstema = behandlingerSelectors.BehandlingstemaKodeSelector(state);
  const registreringUnntakFraMedlemskapToggleEnabled = erFeatureToggleEnabled(
    MELOSYS_REGISTRERING_UNNTAK_FRA_MEDLEMSKAP,
    state
  );
  return harUnntakFlyt(sakstype, sakstema, behandlingstema, registreringUnntakFraMedlemskapToggleEnabled);
};

export const lastInnSaksopplysninger = (sakstype, saksnummer, behandlingID) => async (dispatch, getState) => {
  if (await harTomFlyt(sakstype, getState())) {
    return Promise.all([
      dispatch(fagsakOperations.hent(saksnummer)),
      dispatch(behandlingerOperations.hentBehandling(behandlingID)),
      dispatch(behandlingsresultatOperations.hent(behandlingID)),
      dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
    ]);
  }

  if (await harUnntaksregistreringFlyt(sakstype, getState())) {
    return Promise.all([
      dispatch(fagsakOperations.hent(saksnummer)),
      dispatch(behandlingerOperations.hentBehandling(behandlingID)),
      dispatch(behandlingsresultatOperations.hent(behandlingID)),
      dispatch(mottatteOpplysningerOperations.hent(behandlingID)),
      dispatch(lovvalgsperioderOperations.hent(behandlingID)),
      dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
    ]);
  }

  if (sakstype === MKV.Koder.sakstyper.FTRL) {
    return Promise.all([
      dispatch(fagsakOperations.hent(saksnummer)),
      dispatch(behandlingerOperations.hentBehandling(behandlingID)),
      dispatch(behandlingsresultatOperations.hent(behandlingID)),
      dispatch(mottatteOpplysningerOperations.hent(behandlingID)),
      dispatch(vilkarOperations.hent(behandlingID)),
      dispatch(oppsummertfaktaOperations.hentOppsummertFakta(behandlingID)),
      dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID)),
      dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
    ]);
  }

  if (sakstype === MKV.Koder.sakstyper.EU_EOS) {
    return Promise.all([
      dispatch(fagsakOperations.hent(saksnummer)),
      dispatch(behandlingerOperations.hentBehandling(behandlingID)),
      dispatch(behandlingsresultatOperations.hent(behandlingID)),
      dispatch(mottatteOpplysningerOperations.hent(behandlingID)),
      dispatch(vilkarOperations.hent(behandlingID)),
      dispatch(anmodningsperioderOperations.hent(behandlingID)),
      dispatch(avklartefaktaOperations.hent(behandlingID)),
      dispatch(lovvalgsperioderOperations.hent(behandlingID)),
      dispatch(utpekingsperioderOperations.hent(behandlingID)),
      dispatch(behandlingsperioderOperations.hentMedlemsPerioder(behandlingID)),
      dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
    ]);
  }

  return Promise.all([
    dispatch(fagsakOperations.hent(saksnummer)),
    dispatch(behandlingerOperations.hentBehandling(behandlingID)),
    dispatch(behandlingsresultatOperations.hent(behandlingID)),
    dispatch(mottatteOpplysningerOperations.hent(behandlingID)),
    dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
  ]);
};

export const lastInnSaksopplysningerTomFlyt = (saksnummer, behandlingID) => (dispatch) => {
  dispatch(fagsakOperations.hent(saksnummer));
  dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer));
  dispatch(behandlingerOperations.hentBehandling(behandlingID));
  dispatch(behandlingsresultatOperations.hent(behandlingID));
};

export const lastInnSaksopplysningerRegistreringUnntaksperioder = (saksnummer, behandlingID) => (dispatch) => {
  dispatch(fagsakOperations.hent(saksnummer));
  dispatch(behandlingerOperations.hentBehandling(behandlingID));
  dispatch(behandlingsresultatOperations.hent(behandlingID));
  dispatch(avklartefaktaOperations.hent(behandlingID));
  dispatch(vilkarOperations.hent(behandlingID));
  dispatch(lovvalgsperioderOperations.hent(behandlingID));
  dispatch(behandlingsperioderOperations.hentMedlemsPerioder(behandlingID));
  dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer));
};

export const lastInnSaksopplysningerBehandleMottattAOU = (saksnummer, behandlingID) => (dispatch, getState) => {
  dispatch(behandlingerOperations.hentBehandling(behandlingID));
  dispatch(behandlingsresultatOperations.hent(behandlingID));
  dispatch(anmodningsperioderOperations.hent(behandlingID)).then(() => {
    const anmodningsperiodeID = anmodningsperioderSelectors.AnmodningsperiodeIDSelector(getState());
    dispatch(anmodningsperiodesvarOperations.hent(anmodningsperiodeID));
  });
  dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer));
};

export const resetSaksopplysninger = () => (dispatch) => {
  dispatch(fagsakOperations.resetFagsakState());
  dispatch(behandlingerOperations.resetBehandlingerState());
  dispatch(mottatteOpplysningerOperations.resetState());
  dispatch(behandlingsresultatOperations.resetBehandlingsresultatState());
  dispatch(avklartefaktaOperations.resetAvklartefaktaState());
  dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState());
  dispatch(vilkarOperations.resetState());
  dispatch(behandlingsperioderOperations.resetPerioderState());
  dispatch(utpekingsperioderOperations.resetUtpekingsperioderState());
  dispatch(dokumenterOperations.resetDokument());
  dispatch(anmodningsperioderOperations.resetAnmodningsperioderState());
  dispatch(anmodningsperiodesvarOperations.resetAnmodningsperiodesvarState());
};

export const lagreAllData = () => async (dispatch, getState) => {
  const sakstype = fagsakSelectors.SakstypeKodeSelector(getState());
  const skalLagreMottatteOpplysninger = !(await harTomFlyt(sakstype, getState()));

  switch (sakstype) {
    case MKV.Koder.sakstyper.FTRL:
      return Promise.all([
        ...(skalLagreMottatteOpplysninger ? [dispatch(mottatteOpplysningerOperations.lagre())] : []),
        dispatch(vilkarOperations.lagre()),
      ]);
    case MKV.Koder.sakstyper.TRYGDEAVTALE:
      return skalLagreMottatteOpplysninger
        ? Promise.all[dispatch(mottatteOpplysningerOperations.lagre())]
        : Promise.resolve();
    case MKV.Koder.sakstyper.EU_EOS: {
      const anmodningErSendtUtland = anmodningsperioderSelectors.AlleAnmodningsperioderSendtUtlandSelector(getState());

      await Promise.all([
        ...(skalLagreMottatteOpplysninger ? [dispatch(mottatteOpplysningerOperations.lagre())] : []),
        ...(anmodningErSendtUtland ? [] : [dispatch(vilkarOperations.lagre())]),
        ...(anmodningErSendtUtland ? [] : [dispatch(avklartefaktaOperations.lagre())]),
        ...(anmodningErSendtUtland ? [] : [dispatch(behandlingsperioderOperations.lagre())]),
      ]);

      return Promise.all([
        ...(anmodningErSendtUtland ? [] : [dispatch(anmodningsperioderOperations.lagre())]),
        dispatch(lovvalgsperioderOperations.lagre()),
        ...(anmodningErSendtUtland ? [] : [dispatch(utpekingsperioderOperations.lagre())]),
      ]);
    }
    default:
      return Promise.resolve();
  }
};
