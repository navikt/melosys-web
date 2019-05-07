import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL, BEHANDLINGSPERIODER } from '../api-constants';

export const oppdaterStatus = (behandlingID, status) => {
  const URI_BEHANDLINGER_STATUS = `${API_BASE_URL}${BEHANDLINGSPERIODER}/${behandlingID}/status`;
  return postAsJson(URI_BEHANDLINGER_STATUS, { behandlingsstatus: status });
};

export const sendPerioder = (behandlingID, perioder) => {
  const URI_BEHANDLINGER_PERIODER = `${API_BASE_URL}${BEHANDLINGSPERIODER}/${behandlingID}/perioder`;
  return postAsJson(URI_BEHANDLINGER_PERIODER, perioder);
};

export const hentPerioder = behandlingID => {
  const URI_BEHANDLINGER_PERIODER = `${API_BASE_URL}${BEHANDLINGSPERIODER}/${behandlingID}/perioder`;
  return getAsJson(URI_BEHANDLINGER_PERIODER);
};
