import { API_BASE_URL, DOKUMENTER } from '../../../api-constants';
import { getAsJson } from '../../../utils';

export const uriPath = (journalpostID, dokumentID) => (`${API_BASE_URL}${DOKUMENTER}/pdf/${journalpostID}/${dokumentID}`);

export const hent = (journalpostID, dokumentID) => getAsJson(uriPath(journalpostID, dokumentID));
