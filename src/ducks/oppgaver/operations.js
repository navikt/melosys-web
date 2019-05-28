/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import * as MKV from 'melosys-kodeverk';

import { doThenDispatch } from '../../services/utils';
import * as Api from '../../services/api';
import * as Types from './types';

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

export const tilbakelegge = (behandlingID, venterPaaDokumentasjon) => {
  const oppgaveObjekt = {
    behandlingID,
    begrunnelse: null, // Ingen begrunnelse i Melosys 1.0
    venterPaaDokumentasjon,
  };

  return Api.Oppgaver.tilbakelegge(oppgaveObjekt).catch(error => error);
};

export const sendBehandlingsOppgave = async checkboxliste => {
  const { sakstyper: sakstyperListe = [], behandlingstyper: behandlingstyperListe = [] } = checkboxliste;
  if (sakstyperListe.length === 0) { return false; }

  const sakstyper = Object.keys(sakstyperListe).filter(sakstype => sakstyperListe[sakstype]);
  const behandlingstyper = Object.keys(behandlingstyperListe).filter(behandlingstype => behandlingstyperListe[behandlingstype]);

  const oppgave = {
    oppgavetype: MKV.Koder.oppgavetyper.BEH_SAK_MK,
    sakstyper,
    behandlingstyper,
  };

  const response = await Api.Oppgaver.send(oppgave);
  const { saksnummer } = response;
  if (!saksnummer) { return false; }
  return `/saksbehandling/${saksnummer}`;
};

export const sendJournalOppgave = async fagomrade => {
  const oppgave = {
    oppgavetype: MKV.Koder.oppgavetyper.JFR,
    sakstyper: [],
    behandlingstyper: [],
    fagomrade, // 'UFM' || 'MDL'
  };
  const response = await Api.Oppgaver.send(oppgave);
  const { oppgaveID, journalpostID } = response;
  if (!(oppgaveID || journalpostID)) { return false; }
  return `/journalforing/${journalpostID}/${oppgaveID}`;
};
