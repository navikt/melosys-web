import { postAsJson } from '../../utils';
import { API_BASE_URL, FAGSAKER } from '../../api-constants';

export const send = data => postAsJson(`${API_BASE_URL}${FAGSAKER}/sok`, data);
