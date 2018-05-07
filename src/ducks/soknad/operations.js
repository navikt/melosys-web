import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';

import * as Types from './types';

/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

// Action Creators
export function hentSoknad(behandlingID) {
  return doThenDispatch(() => Api.Soknader.hentSoknader(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function sendSoknad(bid, soknad) {
  return doThenDispatch(() => Api.Soknader.sendSoknad(bid, soknad), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
