import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export function hent(journalpostID, oppgaveID) {
  const URI_JOURNALFORING_OPPGAVE = `${API_BASE_URL}journalforing/${journalpostID}/${oppgaveID}`;
  return getAsJson(URI_JOURNALFORING_OPPGAVE);
}

export function opprett(data) {
  const URI_JOURNALFORING_OPPRETT_NYSAK = `${API_BASE_URL}journalforing/opprett`;
  return postAsJson(URI_JOURNALFORING_OPPRETT_NYSAK, data);
}
export function tilordne(data) {
  const URI_JOURNALFORING_TILORDNE_SAK = `${API_BASE_URL}journalforing/tilordne`;
  return postAsJson(URI_JOURNALFORING_TILORDNE_SAK, data);
}
