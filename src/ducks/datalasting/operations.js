import * as Utils from "../../utils";
import MKV from "../../melosyskodeverk";

import { avklartefaktaOperations } from "../avklartefakta";
import { fagsakOperations } from "../fagsaker";
import { behandlingerOperations } from "../behandlinger";
import { behandlingsresultatOperations } from "../behandlingsresultat";
import { behandlingsgrunnlagOperations } from "../behandlingsgrunnlag";
import { lovvalgsperioderOperations } from "../lovvalgsperioder";
import { vilkarOperations } from "../vilkar";
import { behandlingsperioderOperations } from "../behandlingsperioder";
import { anmodningsperioderOperations } from "../anmodningsperioder";
import { anmodningsperiodesvarOperations } from "../anmodningsperiodesvar";
import { utpekingsperioderOperations } from "../utpekingsperioder";
import { dokumenterOperations } from "../dokumenter";

export const lastInnSaksopplysninger = (sakstype, saksnummer, behandlingID) => (dispatch) => {
  try {
    if (sakstype === MKV.Koder.sakstyper.FTRL) {
      dispatch(fagsakOperations.hent(saksnummer));
      dispatch(behandlingerOperations.hentBehandling(behandlingID));
      dispatch(behandlingsgrunnlagOperations.hent(behandlingID));
      dispatch(behandlingsresultatOperations.hent(behandlingID));
      dispatch(vilkarOperations.hent(behandlingID));
      dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer));
    } else {
      dispatch(anmodningsperioderOperations.hent(behandlingID));
      dispatch(fagsakOperations.hent(saksnummer));
      dispatch(behandlingerOperations.hentBehandling(behandlingID));
      dispatch(behandlingsgrunnlagOperations.hent(behandlingID));
      dispatch(behandlingsresultatOperations.hent(behandlingID));
      dispatch(avklartefaktaOperations.hent(behandlingID));
      dispatch(vilkarOperations.hent(behandlingID));
      dispatch(lovvalgsperioderOperations.hent(behandlingID));
      dispatch(utpekingsperioderOperations.hent(behandlingID));
      dispatch(behandlingsperioderOperations.hentMedlemsPerioder(behandlingID));
      dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer));
    }
  } catch (e) {
    Utils.logger.error(e);
  }
};

export const lastInnSaksopplysningerSedBehandling = (saksnummer, behandlingID) => (dispatch) => {
  try {
    dispatch(fagsakOperations.hent(saksnummer));
    dispatch(behandlingerOperations.hentBehandling(behandlingID));
    dispatch(behandlingsresultatOperations.hent(behandlingID));
    dispatch(avklartefaktaOperations.hent(behandlingID));
    dispatch(vilkarOperations.hent(behandlingID));
    dispatch(lovvalgsperioderOperations.hent(behandlingID));
    dispatch(behandlingsperioderOperations.hentMedlemsPerioder(behandlingID));
    dispatch(dokumenterOperations.hentDokumentOversikt(saksnummer));
  } catch (e) {
    Utils.logger.error(e);
  }
};

export const lastInnSaksopplysningerBehandleMottattAOU = (behandlingID, anmodningsperiodeID) => (dispatch) => {
  try {
    dispatch(behandlingerOperations.hentBehandling(behandlingID));
    dispatch(behandlingsresultatOperations.hent(behandlingID));
    dispatch(anmodningsperioderOperations.hent(behandlingID));
    dispatch(anmodningsperiodesvarOperations.hent(anmodningsperiodeID));
  } catch (e) {
    Utils.logger.error(e);
  }
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
