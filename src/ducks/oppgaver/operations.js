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
 * Soknads sok
 * @param fnr
 * @returns {*}
 */
export function sok(fnr) {
  return doThenDispatch(() => Api.Oppgaver.sok(fnr), {
    OK: Types.SOK_OK,
    FEILET: Types.SOK_FEILET,
    PENDING: Types.SOK_PENDING,
  });
}

/**
 * Hent Soknad
 * @returns {*}
 */
export function hent() {
  return doThenDispatch(() => Api.Oppgaver.oversikt(), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export async function tilbakelegge(behandlingID, venterPaaDokumentasjon) {
  const oppgaveObjekt = {
    behandlingID,
    begrunnelse: null, // Ingen begrunnelse i Melosys 1.0
    venterPaaDokumentasjon,
  };

  return Api.Oppgaver.tilbakelegge(oppgaveObjekt).catch(error => error);
}

export async function sendBehandlingsOppgave(checkboxliste) {
  const { sakstyper: sakstyperListe = [], behandlingstyper: behandlingstyperListe = [] } = checkboxliste;
  if (sakstyperListe.length === 0 || behandlingstyperListe.length === 0) { return false; }

  const sakstyper = Object.keys(sakstyperListe);
  const behandlingstyper = Object.keys(behandlingstyperListe);

  const oppgave = {
    oppgavetype: 'BEH_SAK',
    sakstyper,
    behandlingstyper,
  };

  const response = await Api.Oppgaver.send(oppgave);
  const { saksnummer } = response;
  if (!saksnummer) { return false; }
  return `/saksbehandling/${saksnummer}`;
}

export async function sendJournalOppgave(fagomrade) {
  const oppgave = {
    oppgavetype: 'JFR',
    sakstyper: [],
    behandlingstyper: [],
    fagomrade, // 'UFM' || 'MDL'
  };
  const response = await Api.Oppgaver.send(oppgave);
  const { oppgaveID, journalpostID } = response;
  if (!(oppgaveID || journalpostID)) { return false; }
  return `/journalforing/${journalpostID}/${oppgaveID}`;
}
