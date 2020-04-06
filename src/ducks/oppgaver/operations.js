/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import MKV from '../../melosyskodeverk';

import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Types from './types';
import * as Utils from '../../utils';

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
  return Api.Oppgaver.tilbakelegg(oppgaveObjekt).catch(error => error);
};

export const sendBehandlingsOppgave = async data => {
  const { sakstype, behandlingstema: valgtBehandlingstema } = data;
  if (!sakstype) { return false; }

  const oppgave = {
    sakstype,
    behandlingstema: valgtBehandlingstema,
  };

  const response = await Api.Oppgaver.sendPlukk(oppgave);
  const { saksnummer, behandlingID, behandlingstema } = response;
  if (!saksnummer) { return false; }

  return Utils.url.lagUrl(saksnummer, behandlingID, behandlingstema);
};

export const sendJournalOppgave = async fagomrade => {
  const behandlingstyper = fagomrade === 'MED' ? [] : [fagomrade];

  const oppgave = {
    oppgavetype: MKV.Koder.oppgavetyper.JFR,
    sakstyper: [],
    behandlingstyper,
  };
  const response = await Api.Oppgaver.sendPlukk(oppgave);
  const { oppgaveID, journalpostID } = response;
  if (!(oppgaveID || journalpostID)) { return false; }
  return `/journalforing/${journalpostID}/${oppgaveID}`;
};
