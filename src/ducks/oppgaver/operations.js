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

// Action Creators
export function hentMineSaker() {
  return doThenDispatch(() => Api.Oppgaver.hentOppgaveOversikt(), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppgavePlukker(oppgavetype, checkboxliste) {
  const keys = Object.keys(checkboxliste);
  const behandlingstyper = ['SKND', 'UFM', 'KLG', 'REV', 'ML_U', 'PS_U'].filter(key => keys.includes(key));
  const sakstyper = ['EU_EOS', 'TRG_AVT', 'FLK_TRG'].filter(key => keys.includes(key));
  const oppgave = {
    oppgavetype,
    sakstyper,
    behandlingstyper,
  };

  return Api.Oppgaver.sendPlukkOppgave(oppgave).then(response => {
    const { saksnummer, oppgaveID, journalpostID } = response;
    const saksbehandling = `/saksbehandling/${saksnummer}`;
    const journalforing = `/journalforing/${oppgaveID}/${journalpostID}`;
    return oppgavetype === 'BEH_SAK' ? saksbehandling : journalforing;
  });
}
