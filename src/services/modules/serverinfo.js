import { getAsJson } from '../utils';
import { API_BASE_URL, SERVERINFO } from '../api-constants';

export const hentServerInfo = () => {
  const URI_SERVERINFO = `${API_BASE_URL}${SERVERINFO}`;
  return getAsJson(URI_SERVERINFO);
};
