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
import * as Routing from "../../routing";

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

export const tilbakelegg = (behandlingID, venterPaaDokumentasjon) => {
  const oppgaveObjekt = {
    behandlingID,
    begrunnelse: null, // Ingen begrunnelse i Melosys 1.0
    venterPaaDokumentasjon,
  };

  // TODO legge på logging
  return Api.Oppgaver.tilbakelegg(oppgaveObjekt).catch((error) => error);
};

export const plukkSak = async (data) => {
  const oppgave = {
    sakstype: data.sakstype,
    sakstema: data.sakstema,
    behandlingstema: data.behandlingstema,
  };

  const response = await Api.Oppgaver.sendPlukk(oppgave);
  const { saksnummer, behandlingID, behandlingstema, behandlingstype } = response;
  if (!saksnummer) {
    return false;
  }

  if (data.sakstema) {
    // shortcut istedenfor å dra inn melosys.sakstema toggle
    return Routing.lagUrlNy(saksnummer, behandlingID, data.sakstema, behandlingstema, behandlingstype);
  }
  return Routing.lagUrl(saksnummer, behandlingID, behandlingstema);
};
