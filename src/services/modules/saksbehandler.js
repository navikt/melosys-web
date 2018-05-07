import { getAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export function hentSaksbehandler() {
  const URI_SAKSBEHANDLER = `${API_BASE_URL}saksbehandler`;
  return getAsJson(URI_SAKSBEHANDLER);
}
