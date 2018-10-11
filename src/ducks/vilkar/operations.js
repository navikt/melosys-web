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
import * as Actions from '../vilkar/actions';

export function hent(behandlingID) {
  return doThenDispatch(() => Api.Vilkar.hent(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function send(behandlingID, body) {
  return doThenDispatch(() => Api.Vilkar.send(behandlingID, body), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppdaterVilkarState(skjema) {
  return dispatch => (dispatch(Actions.oppdaterVilkarState(skjema)));
}
