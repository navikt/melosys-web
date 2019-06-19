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
  return doThenDispatch(() => Api.Saksflyt.Anmodningsperioder.hent(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function send(bid, anmodningsperioder) {
  console.log(bid, anmodningsperioder)
  return doThenDispatch(() => Api.Saksflyt.Anmodningsperioder.send(bid, anmodningsperioder), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppdaterAnmodningsperioderState(anmodningsperioder) {
  return dispatch => dispatch(Actions.oppdaterAnmodningsperioder(anmodningsperioder));
}

export function resetAnmodningsperioderState() {
  return dispatch => dispatch(Actions.resetAnmodningsperioderState());
}
