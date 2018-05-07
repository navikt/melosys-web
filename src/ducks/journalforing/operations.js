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


function hentJournalOppgave(journalpostID) {
  return doThenDispatch(() => Api.Journalforing.hentJournalOppgave(journalpostID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}
// TODO Refactor og flytt til ducks/fagsaker/operations.js
function sokFagsaker(fnr) {
  return doThenDispatch(() => Api.Fagsaker.sokFagsaker(fnr), {
    OK: Types.SAKSLISTE_OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export {
  hentJournalOppgave,
  sokFagsaker,
};
