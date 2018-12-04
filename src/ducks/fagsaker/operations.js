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
import * as Validering from '../../felles-komponenter/skjema/validering';

/**
 * Henter registerinformasjon som allerede er importert backend i forbindelse
 * med saken. Kallet får altså kun lagret fagsak fra backend og ikke nødvendigvis oppdatert
 * registerdata fra TPS, Aa-reg etc. Dette er det backend som er ansvarlig for,.
 *
 * @param snr String Saksnummeret
 * @returns {*}
 */
function hent(snr) {
  return doThenDispatch(() => Api.Fagsaker.hent(snr), {
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

function opprett(fnr) {
  return doThenDispatch(
    () => Api.Fagsaker.opprett(fnr), {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    (dispatch, data) => Validering.Felles.forsokValidering(dispatch, data)
  );
}

/**
 * Søker på en liste av fagsaker knyttet til et fnr.
 * @param fnr
 * @returns {*}
 */
function sok(fnr) {
  return doThenDispatch(() => Api.Fagsaker.sok(fnr), {
    OK: Types.SAKSLISTE_OK,
    FEILET: Types.SAKSLISTE_FEILET,
    PENDING: Types.SAKSLISTE_PENDING,
  });
}

function resetFagsakState() {
  return Actions.resetFagsakState();
}
function oppdaterBehandlingsStatus(status) {
  return Actions.oppdaterBehandlingsStatus(status);
}
export {
  hent,
  opprett,
  sok,
  resetFagsakState,
  oppdaterBehandlingsStatus,
};
