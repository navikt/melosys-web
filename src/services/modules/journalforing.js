import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL, JOURNALFORING } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export const hent = journalpostID => {
  const URI_JOURNALFORING_OPPGAVE = `${API_BASE_URL}${JOURNALFORING}/${journalpostID}`;
  return getAsJson(URI_JOURNALFORING_OPPGAVE);
};

export const opprett = data => {
  const URI_JOURNALFORING_OPPRETT_NYSAK = `${API_BASE_URL}${JOURNALFORING}/opprett`;
  return postAsJson(URI_JOURNALFORING_OPPRETT_NYSAK, data);
};
export const tilordne = data => {
  const URI_JOURNALFORING_TILORDNE_SAK = `${API_BASE_URL}${JOURNALFORING}/tilordne`;
  return postAsJson(URI_JOURNALFORING_TILORDNE_SAK, data);
};
