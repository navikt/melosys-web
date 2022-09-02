/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";

import { doThenDispatch } from "../../services/utils";
import * as Actions from "./actions";
import * as Api from "../../services/api";
import * as Types from "./types";
import { navigeringOperations } from "../navigering";

/**
 * Henter registerinformasjon som allerede er importert backend i forbindelse
 * med saken. Kallet får altså kun lagret fagsak fra backend og ikke nødvendigvis oppdatert
 * registerdata fra PDL, Aa-reg etc. Dette er det backend som er ansvarlig for,.
 *
 * @param snr String Saksnummeret
 * @returns {*}
 */
export function hent(snr: string) {
  return doThenDispatch(() => Api.Fagsaker.fagsak.hent(snr), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function opprett(body: Api.Fagsaker.fagsak.OpprettReqDto) {
  return doThenDispatch(
    () => Api.Fagsaker.fagsak.opprett(body),
    {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    {
      success: (dispatch: ThunkDispatch<RootState, unknown, Types.Action>) => {
        dispatch(navigeringOperations.tilForsiden());
      },
    }
  );
}

export function hentMuligeSakstemaer(saksnummer: string) {
  return doThenDispatch(() => Api.Fagsaker.fagsak.hentMuligeSakstemaer(saksnummer), {
    OK: Types.HENT_MULIGE_SAKSTEMA,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function hentMuligeSakstyper(saksnummer: string) {
  return doThenDispatch(() => Api.Fagsaker.fagsak.hentMuligeSakstyper(saksnummer), {
    OK: Types.HENT_MULIGE_SAKSTYPE,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function resetFagsakState() {
  return Actions.resetFagsakState();
}
