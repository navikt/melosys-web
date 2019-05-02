/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */
import { doThenDispatch } from '../../services/utils';
import * as Actions from './actions';
import * as Api from '../../services/api';
import * as Types from './types';

export function hentPerioder(behandlingID) {
  return doThenDispatch(() => Api.Behandlinger.hentPerioder(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function sendPerioder(behandlingID, perioder) {
  return doThenDispatch(() => Api.Behandlinger.sendPerioder(behandlingID, perioder), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppdaterPerioderState(state) {
  return dispatch => (dispatch(Actions.oppdaterPerioderState(state)));
}

export function resetPerioderState() {
  return Actions.resetPerioderState();
}
