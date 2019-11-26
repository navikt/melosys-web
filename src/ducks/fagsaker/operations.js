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

/**
 * Henter registerinformasjon som allerede er importert backend i forbindelse
 * med saken. Kallet får altså kun lagret fagsak fra backend og ikke nødvendigvis oppdatert
 * registerdata fra TPS, Aa-reg etc. Dette er det backend som er ansvarlig for,.
 *
 * @param snr String Saksnummeret
 * @returns {*}
 */
export function hent(snr) {
  return doThenDispatch(() => Api.Fagsaker.fagsak.hent(snr), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function resetFagsakState() {
  return Actions.resetFagsakState();
}
