import MKV from "../../melosyskodeverk";

import { avklartefaktaOperations } from "../avklartefakta";
import { fagsakOperations } from "../fagsaker";
import { behandlingerOperations } from "../behandlinger";
import { behandlingsresultatOperations } from "../behandlingsresultat";
import { behandlingsgrunnlagOperations } from "../behandlingsgrunnlag";
import { lovvalgsperioderOperations } from "../lovvalgsperioder";
import { vilkarOperations } from "../vilkar";
import { behandlingsperioderOperations } from "../behandlingsperioder";
import { anmodningsperioderOperations, anmodningsperioderSelectors } from "../anmodningsperioder";
import { anmodningsperiodesvarOperations } from "../anmodningsperiodesvar";
import { utpekingsperioderOperations } from "../utpekingsperioder";
import { dokumenterOperations } from "../dokumenter";
import { oppsummertfaktaOperations } from "../oppsummertfakta";
import { medlemskapsperioderOperations } from "../medlemskapsperioder";

export const lastInnSaksopplysninger = (sakstype, saksnummer, behandlingID) => (dispatch) => {
  dispatch(fagsakOperations.hent(saksnummer));
  dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer));
  dispatch(behandlingerOperations.hentBehandling(behandlingID));
  dispatch(behandlingsgrunnlagOperations.hent(behandlingID));
  dispatch(behandlingsresultatOperations.hent(behandlingID));

  if (sakstype === MKV.Koder.sakstyper.FTRL) {
    dispatch(vilkarOperations.hent(behandlingID));
    dispatch(oppsummertfaktaOperations.hentOppsummertFakta(behandlingID));
    dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID));
  } else if (sakstype === MKV.Koder.sakstyper.EU_EOS) {
    dispatch(vilkarOperations.hent(behandlingID));
    dispatch(anmodningsperioderOperations.hent(behandlingID));
    dispatch(avklartefaktaOperations.hent(behandlingID));
    dispatch(lovvalgsperioderOperations.hent(behandlingID));
    dispatch(utpekingsperioderOperations.hent(behandlingID));
    dispatch(behandlingsperioderOperations.hentMedlemsPerioder(behandlingID));
  }
};

export const lastInnSaksopplysningerSedBehandling = (saksnummer, behandlingID) => (dispatch) => {
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
  dispatch(behandlingsgrunnlagOperations.resetState());
  dispatch(behandlingsresultatOperations.resetBehandlingsresultatState());
  dispatch(avklartefaktaOperations.resetAvklartefaktaState());
  dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState());
  dispatch(vilkarOperations.resetState());
  dispatch(behandlingsperioderOperations.resetPerioderState());
  dispatch(utpekingsperioderOperations.resetUtpekingsperioderState());
  dispatch(dokumenterOperations.resetDokument());
};

export const lagreAllData = (sakstype) => async (dispatch) => {
  if (sakstype === MKV.Koder.sakstyper.FTRL) {
    return Promise.all([dispatch(behandlingsgrunnlagOperations.lagre()), dispatch(vilkarOperations.lagre())]);
  }

  await Promise.all([
    dispatch(behandlingsgrunnlagOperations.lagre()),
    dispatch(vilkarOperations.lagre()),
    dispatch(avklartefaktaOperations.lagre()),
    dispatch(behandlingsperioderOperations.lagre()),
  ]);

  return Promise.all([
    dispatch(anmodningsperioderOperations.lagre()),
    dispatch(lovvalgsperioderOperations.lagre()),
    dispatch(utpekingsperioderOperations.lagre()),
  ]);
};
