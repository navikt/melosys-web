import { getAsJson } from '../utils';
import { API_BASE_URL, SERVERINFO } from '../api-constants';

export const hentServerInfo = () => getAsJson(`${API_BASE_URL}${SERVERINFO}`);
