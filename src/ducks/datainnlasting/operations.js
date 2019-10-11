import * as Utils from '../../utils';

import { avklartefaktaOperations } from '../avklartefakta';
import { fagsakOperations } from '../fagsaker';
import { behandlingerOperations } from '../behandlinger';
import { behandlingsresultatOperations } from '../behandlingsresultat';
import { soknadOperations } from '../soknad';
import { lovvalgsperioderOperations } from '../lovvalgsperioder';
import { vilkarOperations } from '../vilkar';
import { behandlingsperioderOperations } from '../behandlingsperioder';


export const lastInnSaksopplysninger = (saksnummer, behandlingID) => {
  return dispatch => {
    try {
      dispatch(fagsakOperations.hent(saksnummer));
      dispatch(behandlingerOperations.hentBehandling(behandlingID));
      dispatch(soknadOperations.hent(behandlingID));
      dispatch(behandlingsresultatOperations.hent(behandlingID));
      dispatch(avklartefaktaOperations.hent(behandlingID));
      dispatch(vilkarOperations.hent(behandlingID));
      dispatch(lovvalgsperioderOperations.hent(behandlingID));
      dispatch(behandlingsperioderOperations.hentMedlemsPerioder(behandlingID));
    } catch (e) {
      Utils.logger.error(e);
    }
  };
};

export const resetSaksopplysninger = () => (
  dispatch => {
    dispatch(fagsakOperations.resetFagsakState());
    dispatch(behandlingerOperations.resetBehandlingerState());
    dispatch(soknadOperations.resetSoknadState());
    dispatch(behandlingsresultatOperations.resetBehandlingsresultatState());
    dispatch(avklartefaktaOperations.resetAvklartefaktaState());
    dispatch(lovvalgsperioderOperations.resetLovvalgsperioderState());
    dispatch(vilkarOperations.resetVilkarState());
    dispatch(behandlingsperioderOperations.resetPerioderState());
  }
);
