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
  return doThenDispatch(
    () => Api.Oppgaver.sok(fnr), {
      OK: Types.SOK_OK,
      FEILET: Types.SOK_FEILET,
      PENDING: Types.SOK_PENDING,
    },
    (dispatch, data) => `Validering: oppgaver:sok(${JSON.stringify(data)})`
  );
}

/**
 * Hent Soknad
 * @returns {*}
 */
export function hent() {
  return doThenDispatch(
    () => Api.Oppgaver.oversikt(), {
      OK: Types.OK,
      FEILET: Types.FEILET,
      PENDING: Types.PENDING,
    },
    (dispatch, data) => `Validering: oppgaver:hent(${JSON.stringify(data)})`
  );
}

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
    const { saksnummer } = response;
    if (!saksnummer) { return false; }
    return `/saksbehandling/${saksnummer}`;
  });
}

export function sendJournalOppgave(fagomrade) {
  const oppgave = {
    oppgavetype: 'JFR',
    sakstyper: [],
    behandlingstyper: [],
    fagomrade, // 'UFM' || 'MDL'
  };
  return Api.Oppgaver.send(oppgave).then(response => {
    const { oppgaveID, journalpostID } = response;
    if (!(oppgaveID || journalpostID)) { return false; }
    return `/journalforing/${oppgaveID}/${journalpostID}`;
  });
}
