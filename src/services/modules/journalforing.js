import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL, JOURNALFORING } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export const hent = journalpostID => getAsJson(`${API_BASE_URL}${JOURNALFORING}/${journalpostID}`);
export const opprett = data => postAsJson(`${API_BASE_URL}${JOURNALFORING}/opprett`, data);
export const tilordne = data => postAsJson(`${API_BASE_URL}${JOURNALFORING}/tilordne`, data);
