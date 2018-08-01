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

/**
 * Send soknad
 * @param oppgavetype
 * @param checkboxliste
 * @returns {Promise|*|Function|PromiseLike<string>|Promise<string>}
 */
export function send(oppgavetype, checkboxliste) {
  const keys = Object.keys(checkboxliste);
  const behandlingstyper = ['SKND', 'UFM', 'KLG', 'REV', 'ML_U', 'PS_U'].filter(key => keys.includes(key));
  const sakstyper = ['EU_EOS', 'TRG_AVT', 'FLK_TRG'].filter(key => keys.includes(key));
  const oppgave = {
    oppgavetype,
    sakstyper,
    behandlingstyper,
  };

  return Api.Oppgaver.send(oppgave).then(response => {
    const { saksnummer, oppgaveID, journalpostID } = response;
    if (!saksnummer && (!oppgaveID || !journalpostID)) { return false; }
    const saksbehandling = `/saksbehandling/${saksnummer}`;
    const journalforing = `/journalforing/${oppgaveID}/${journalpostID}`;
    return oppgavetype === 'BEH_SAK' ? saksbehandling : journalforing;
  });
}
/*
export function sendBehandlingsOppgave(checkboxliste) {
  const keys = Object.keys(checkboxliste);
  const behandlingstyper = ['SKND', 'UFM', 'KLG', 'REV', 'ML_U', 'PS_U'].filter(key => keys.includes(key));
  const sakstyper = ['EU_EOS', 'TRG_AVT', 'FLK_TRG'].filter(key => keys.includes(key));
  const oppgave = {
    oppgavetype: 'BEH_SAK',
    sakstyper,
    behandlingstyper,
  };

  return Api.Oppgaver.send(oppgave).then(response => {
    const { saksnummer, oppgaveID, journalpostID } = response;
    if (!saksnummer && (!oppgaveID || !journalpostID)) { return false; }
    return `/saksbehandling/${saksnummer}`;
  });
}
*/
export function sendJournalOppgave(fagomrade) {
  const oppgave = {
    oppgavetype: 'JFR',
    sakstyper: [],
    behandlingstyper: [],
    fagomrade, // 'UFM' || 'MDL'
  };
  return Api.Oppgaver.send(oppgave).then(response => {
    const { saksnummer, oppgaveID, journalpostID } = response;
    if (!saksnummer && (!oppgaveID || !journalpostID)) { return false; }
    return `/journalforing/${oppgaveID}/${journalpostID}`;
  });
}
