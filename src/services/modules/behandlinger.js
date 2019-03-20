import { postAsJson } from '../utils';
import { API_BASE_URL, BEHANDLINGER } from '../api-constants';

export const oppdaterStatus = (behandlingID, status) => {
  const URI_BEHANDLINGER_STATUS = `${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/status`;
  return postAsJson(URI_BEHANDLINGER_STATUS, { behandlingsstatus: status });
};
export const sendPerioder = (behandlingID, perioder) => {
  const URI_BEHANDLINGER_PERIODER = `${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/perioder`;
  return postAsJson(URI_BEHANDLINGER_PERIODER, perioder);
};

