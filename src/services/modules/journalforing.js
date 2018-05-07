import { getAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export function hentJournalOppgave(journalpostID) {
  const URI_JOURNALFORING_OPPGAVE = `${API_BASE_URL}journalforing/${journalpostID}`;
  return getAsJson(URI_JOURNALFORING_OPPGAVE);
}

