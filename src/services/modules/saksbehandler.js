import { getAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export function hent() {
  const URI_SAKSBEHANDLER = `${API_BASE_URL}saksbehandler`;
  return getAsJson(URI_SAKSBEHANDLER);
}
