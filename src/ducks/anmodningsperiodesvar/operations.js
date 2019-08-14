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

export function hent(anmodningsperiodeID) {
  return doThenDispatch(() => Api.Anmodningsperioder.svar.hent(anmodningsperiodeID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function send(anmodningsperiodeID, anmodningsperiodesvar) {
  return doThenDispatch(() => Api.Anmodningsperioder.svar.send(anmodningsperiodeID, anmodningsperiodesvar), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppdaterAnmodningsperiodesvarState(anmodningsperiodesvar) {
  return dispatch => dispatch(Actions.oppdaterAnmodningsperiodesvar(anmodningsperiodesvar));
}

export function resetAnmodningsperiodesvarState() {
  return dispatch => dispatch(Actions.resetAnmodningsperiodesvarState());
}
