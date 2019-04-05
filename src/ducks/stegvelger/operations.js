/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import * as Types from './types';
import * as Actions from './actions';

export function resetStegvelgerState() {
  return { type: Types.RESET };
}

export function oppdaterSteg(steg, felt, verdi) {
  return dispatch => (dispatch(Actions.oppdaterSteg(steg, felt, verdi)));
}

export function nyttSteg(steg) {
  return dispatch => (dispatch(Actions.nyttSteg(steg)));
}

export function slettSteg(steg) {
  return dispatch => (dispatch(Actions.slettSteg(steg)));
}
