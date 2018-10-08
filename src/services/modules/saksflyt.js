import { getAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

export function sjekkStatus(behandlingID) {
  const URI_HENT_SAKSFLYTSTATUS = `${API_BASE_URL}saksflyt/status/${behandlingID}`;
  return getAsJson(URI_HENT_SAKSFLYTSTATUS);
}
