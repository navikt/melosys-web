import { getAsJson } from '../../utils';
import { API_BASE_URL, FAGSAKER } from '../../api-constants';

export const sokFagsak = fnr => getAsJson(`${API_BASE_URL}${FAGSAKER}/sok/?fnr=${fnr}`);
