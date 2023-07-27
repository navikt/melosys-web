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

/**
 * Hent Soknad
 * @returns {*}
 */
export const oversikt = () =>
  doThenDispatch(() => Api.Oppgaver.oversikt(), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });

export const plukkSak = async (data) => {
  const oppgave = {
    sakstype: data.sakstype,
    sakstema: data.sakstema,
    behandlingstema: data.behandlingstema,
  };

  return Api.Oppgaver.sendPlukk(oppgave);
};
