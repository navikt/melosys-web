/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import * as Api from '../../services/api';
import { doThenDispatch } from '../../services/utils';
import * as Types from './types';
import * as Actions from './actions';

export function hent(behandlingID) {
  return doThenDispatch(() => Api.Avklartefakta.hent(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function send(bid, dokument) {
  return doThenDispatch(() => Api.Avklartefakta.send(bid, dokument), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppdaterAvklarteFaktaState(skjema) {
  return dispatch => (dispatch(Actions.oppdaterAvklartefaktaState(skjema)));
}

export function resetAvklartefaktaState() {
  return Actions.resetAvklartefaktaState();
}
