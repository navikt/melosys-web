import { getAsJson } from '../utils';
import { API_BASE_URL, SAKSBEHANDLER } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export async function hent() {
  const URI_SAKSBEHANDLER = `${API_BASE_URL}${SAKSBEHANDLER}`;
  return getAsJson(URI_SAKSBEHANDLER);
}
