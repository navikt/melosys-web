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

export function hent(behandlingID) {
  return doThenDispatch(
    () => Api.Faktaavklaring.hent(behandlingID), {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    (dispatch, data) => `Validering: faktaavklaring:hent(${JSON.stringify(data)})`
  );
}

export function send(bid, dokument) {
  return doThenDispatch(
    () => Api.Faktaavklaring.send(bid, dokument), {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    (dispatch, data) => `Validering: faktaavklaring:send(${JSON.stringify(data)})`
  );
}
