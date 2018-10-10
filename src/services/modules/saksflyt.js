import { getAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

function status(behandlingID) {
  const URI_HENT_SAKSFLYTSTATUS = `${API_BASE_URL}saksflyt/status/${behandlingID}`;
  return getAsJson(URI_HENT_SAKSFLYTSTATUS);
}

export { status };
