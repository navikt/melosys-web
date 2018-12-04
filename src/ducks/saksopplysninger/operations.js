/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Types from './types';

/* eslint-disable import/prefer-default-export */
export function sjekkStatus(behandlingID) {
  return doThenDispatch(() => Api.Saksopplysninger.sjekkStatus(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

/**
 * Kaller backend for å be om oppfrisking av en sak.
 * @param behandlingID
 * @returns {*}
 */
export function oppfrisk(behandlingID) {
  return Api.Saksopplysninger.oppfrisk(behandlingID);
}
