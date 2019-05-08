import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL, BEHANDLINGSPERIODER } from '../api-constants';

export const oppdaterStatus = (behandlingID, status) => {
  const URI_BEHANDLINGER_STATUS = `${API_BASE_URL}${BEHANDLINGSPERIODER}/${behandlingID}/status`;
  return postAsJson(URI_BEHANDLINGER_STATUS, { behandlingsstatus: status });
};

export const sendMedlemsPerioder = (behandlingID, perioder) => {
  const URI_BEHANDLINGER_PERIODER = `${API_BASE_URL}${BEHANDLINGSPERIODER}/${behandlingID}/medlemsperioder`;
  return postAsJson(URI_BEHANDLINGER_PERIODER, perioder);
};

export const hentMedlemsPerioder = behandlingID => {
  const URI_BEHANDLINGER_PERIODER = `${API_BASE_URL}${BEHANDLINGSPERIODER}/${behandlingID}/medlemsperioder`;
  return getAsJson(URI_BEHANDLINGER_PERIODER);
};
