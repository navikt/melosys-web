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

/**
 * Henter registerinformasjon som allerede er importert backend i forbindelse
 * med saken. Kallet får altså kun lagret fagsak fra backend og ikke nødvendigvis oppdatert
 * registerdata fra TPS, Aa-reg etc. Dette er det backend som er ansvarlig for,.
 *
 * @param snr String Saksnummeret
 * @returns {*}
 */
function hentFagsaker(snr) {
  return doThenDispatch(() => Api.Fagsaker.hentFagsaker(snr), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

/**
 * Oppretter en ny fagsak dersom dette ikke er gjort tidligere. Backend henter registerdata fra
 * TPS, Aa-reg etc og lagrer i Melosys-databasen før frontend mottar JSON med fagsaken.
 * @param fnr String Fødselsnummeret til vedkommende som det skal opprettes ny fagsak på.
 * @returns {*}
 */

function opprettNyFagsak(fnr) {
  return doThenDispatch(() => Api.Fagsaker.opprettNyFagsak(fnr), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

/**
 * Søker på en liste av fagsaker knyttet til et fnr.
 * @param fnr
 * @returns {*}
 */
function sokFagsaker(fnr) {
  return doThenDispatch(() => Api.Fagsaker.sokFagsaker(fnr), {
    OK: Types.SAKSLISTE_OK,
    FEILET: Types.SAKSLISTE_FEILET,
    PENDING: Types.SAKSLISTE_PENDING,
  });
}

export {
  hentFagsaker,
  opprettNyFagsak,
  sokFagsaker,
};
