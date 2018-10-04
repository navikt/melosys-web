import { getAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

function status(behandlingID) {
  const URI_HENT_BEHANDLINGSTATUS = `${API_BASE_URL}behandlinger/${behandlingID}/status`;
  return getAsJson(URI_HENT_BEHANDLINGSTATUS);
}

export {
  status,
};
