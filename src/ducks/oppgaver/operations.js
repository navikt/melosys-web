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

export const sendBehandlingsOppgave = async checkboxliste => {
  const { sakstyper: sakstyperListe = [], behandlingstyper: behandlingstyperListe = [] } = checkboxliste;
  if (sakstyperListe.length === 0) { return false; }

  const sakstyper = Object.keys(sakstyperListe).filter(sakstype => sakstyperListe[sakstype]);
  const behandlingstyper = Object.keys(behandlingstyperListe).filter(behandlingstype => behandlingstyperListe[behandlingstype]);

  const oppgave = {
    oppgavetype: null,
    sakstyper,
    behandlingstyper,
  };

  const response = await Api.Oppgaver.sendPlukk(oppgave);
  const { saksnummer, behandlingID, oppgavetype } = response;
  if (!saksnummer) { return false; }

  if (oppgavetype === MKV.Koder.oppgavetyper.BEH_SAK_MK || oppgavetype === MKV.Koder.oppgavetyper.VUR) {
    return `/saksbehandling/${saksnummer}/?behandlingID=${behandlingID}`;
  } else if (oppgavetype === MKV.Koder.oppgavetyper.BEH_SED) {
    return `/registrering/${saksnummer}/unntaksperioder/?behandlingID=${behandlingID}`;
  }

  Utils.logger.error(`Ukjent oppgavetype ${oppgavetype} kan ikke åpnes.`);
  return null;
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
