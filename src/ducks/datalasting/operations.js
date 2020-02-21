import * as Utils from '../../utils';

import { avklartefaktaOperations } from '../avklartefakta';
import { fagsakOperations } from '../fagsaker';
import { behandlingerOperations } from '../behandlinger';
import { behandlingsresultatOperations } from '../behandlingsresultat';
import { behandlingsgrunnlagOperations } from '../behandlingsgrunnlag';
import { lovvalgsperioderOperations } from '../lovvalgsperioder';
import { vilkarOperations } from '../vilkar';
import { behandlingsperioderOperations } from '../behandlingsperioder';
import { anmodningsperioderOperations } from '../anmodningsperioder';
import { anmodningsperiodesvarOperations } from '../anmodningsperiodesvar';
import { utpekingsperioderOperations } from '../utpekingsperioder';


export const lastInnSaksopplysninger = (saksnummer, behandlingID) => (
  dispatch => {
    try {
      dispatch(fagsakOperations.hent(saksnummer));
      dispatch(behandlingerOperations.hentBehandling(behandlingID));
      dispatch(behandlingsgrunnlagOperations.hent(behandlingID));
      dispatch(behandlingsresultatOperations.hent(behandlingID));
      dispatch(avklartefaktaOperations.hent(behandlingID));
      dispatch(vilkarOperations.hent(behandlingID));
      dispatch(lovvalgsperioderOperations.hent(behandlingID));
      dispatch(utpekingsperioderOperations.hent(behandlingID));
      dispatch(behandlingsperioderOperations.hentMedlemsPerioder(behandlingID));
    } catch (e) {
      Utils.logger.error(e);
    }
  }
);

export const lastInnSaksopplysningerSedBehandling = (saksnummer, behandlingID) => (
  dispatch => {
    try {
      dispatch(fagsakOperations.hent(saksnummer));
      dispatch(behandlingerOperations.hentBehandling(behandlingID));
      dispatch(behandlingsgrunnlagOperations.hent(behandlingID));
      dispatch(behandlingsresultatOperations.hent(behandlingID));
      dispatch(avklartefaktaOperations.hent(behandlingID));
      dispatch(vilkarOperations.hent(behandlingID));
      dispatch(lovvalgsperioderOperations.hent(behandlingID));
      dispatch(behandlingsperioderOperations.hentMedlemsPerioder(behandlingID));
    } catch (e) {
      Utils.logger.error(e);
    }
  }
);

export const lastInnSaksopplysningerBehandleMottattAOU = (behandlingID, anmodningsperiodeID) => (
  dispatch => {
    try {
      dispatch(behandlingerOperations.hentBehandling(behandlingID));
      dispatch(behandlingsgrunnlagOperations.hent(behandlingID));
      dispatch(anmodningsperioderOperations.hent(behandlingID));
      dispatch(anmodningsperiodesvarOperations.hent(anmodningsperiodeID));
    } catch (e) {
      Utils.logger.error(e);
    }
  }
);

export const resetSaksopplysninger = () => (
  dispatch => {
    dispatch(fagsakOperations.resetFagsakState());
    dispatch(behandlingerOperations.resetBehandlingerState());
    dispatch(behandlingsgrunnlagOperations.resetState());
    dispatch(behandlingsresultatOperations.resetBehandlingsresultatState());
    dispatch(avklartefaktaOperations.resetAvklartefaktaState());
    dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState());
    dispatch(vilkarOperations.resetVilkarState());
    dispatch(behandlingsperioderOperations.resetPerioderState());
    dispatch(utpekingsperioderOperations.resetUtpekingsperioderState());
  }
);

export const lagreAllData = () => (
  async dispatch => {
    try {
      await Promise.all([
        dispatch(behandlingsgrunnlagOperations.lagre()),
        dispatch(vilkarOperations.lagre()),
        dispatch(avklartefaktaOperations.lagre()),
        dispatch(behandlingsperioderOperations.lagre()),
      ]);

      dispatch(anmodningsperioderOperations.lagre());
      dispatch(lovvalgsperioderOperations.lagre());
      dispatch(utpekingsperioderOperations.lagre());
    } catch (e) {
      Utils.logger.error(e);
    }
  }
);
