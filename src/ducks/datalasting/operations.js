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
// noinspection ES6PreferShortImport
import { harIkkeYrkesaktivFlyt, harUnntaksregistreringFlyt, skalViseIngenFlyt } from "../../url/url";
import { erFeatureToggleEnabled } from "../../featuretoggle";
import { MELOSYS_PENSJONIST, MELOSYS_PENSJONIST_EØS } from "../../featuretoggle/toggleNavn";
import { helseutgiftDekkesPeriodeOperations } from "../helseutgiftdekkesperiode";

const harIngenFlyt = async (sakstype, state) => {
  const sakstema = fagsakSelectors.SakstemaKodeSelector(state);
  const behandlingstema = behandlingerSelectors.BehandlingstemaKodeSelector(state);
  const behandlingstype = behandlingerSelectors.BehandlingstypeKodeSelector(state);

  const erPensjonistToggleEnabled = erFeatureToggleEnabled(MELOSYS_PENSJONIST, state);
  const erPensjonistToggleEnabled_EØS = erFeatureToggleEnabled(MELOSYS_PENSJONIST_EØS, state);

  return skalViseIngenFlyt(
    sakstype,
    sakstema,
    behandlingstema,
    behandlingstype,
    erPensjonistToggleEnabled,
    erPensjonistToggleEnabled_EØS,
  );
};
const harUnntaksregistreringEllerIkkeYrkesaktivFlyt = (sakstype, state) => {
  const sakstema = fagsakSelectors.SakstemaKodeSelector(state);
  const behandlingstema = behandlingerSelectors.BehandlingstemaKodeSelector(state);

  return (
    harUnntaksregistreringFlyt(sakstype, sakstema, behandlingstema) || harIkkeYrkesaktivFlyt(sakstype, behandlingstema)
  );
};

export const lastInnSaksopplysninger = (sakstype, saksnummer, behandlingID) => async (dispatch, getState) => {
  if (await harIngenFlyt(sakstype, getState())) {
    return Promise.all([
      dispatch(fagsakOperations.hent(saksnummer)),
      dispatch(behandlingerOperations.hentBehandling(behandlingID)),
      dispatch(behandlingsresultatOperations.hent(behandlingID)),
      dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
    ]);
  }

  if (harUnntaksregistreringEllerIkkeYrkesaktivFlyt(sakstype, getState())) {
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
      dispatch(oppsummertfaktaOperations.hentOppsummertFakta(behandlingID)),
      dispatch(anmodningsperioderOperations.hent(behandlingID)),
      dispatch(avklartefaktaOperations.hent(behandlingID)),
      dispatch(lovvalgsperioderOperations.hent(behandlingID)),
      dispatch(helseutgiftDekkesPeriodeOperations.hentHelseutgiftDekkesPeriode(behandlingID)),
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
    dispatch(lovvalgsperioderOperations.hent(behandlingID)),
    dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer)),
  ]);
};

export const lastInnSaksopplysningerIngenFlyt = (saksnummer, behandlingID) => (dispatch) => {
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
  const skalLagreMottatteOpplysninger = !(await harIngenFlyt(sakstype, getState()));

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
