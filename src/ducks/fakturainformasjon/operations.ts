/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */
import { doThenDispatch } from "../../services/utils";
import * as Api from "../../services/api";
import * as Types from "./types";

export function hentFakturaserie(vedtaksId: string) {
  return doThenDispatch(() => Api.Faktureringskomponenten.hentFakturaserie(vedtaksId), {
    OK: Types.OKFakturaserie,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function hentFakturainformasjon(fakturaNr: string) {
  return doThenDispatch(() => Api.Faktureringskomponenten.hentFakturainfo(fakturaNr), {
    OK: Types.OKFakturainfo,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
