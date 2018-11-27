import { postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

export function oppdaterStatus(behandlingID, status) {
  const URI_BEHANDLINGER_STATUS = `${API_BASE_URL}behandlinger/${behandlingID}/status`;
  return postAsJson(URI_BEHANDLINGER_STATUS, { behandlingsstatus: status });
}
