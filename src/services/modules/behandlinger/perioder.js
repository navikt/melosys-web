import { getAsJson, postAsJson } from '../../utils';
import { API_BASE_URL, BEHANDLINGSPERIODER } from '../../api-constants';

export const oppdaterStatus = (behandlingID, status) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGSPERIODER}/${behandlingID}/status`, { behandlingsstatus: status });

export const sendMedlemsPerioder = (behandlingID, perioder) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGSPERIODER}/${behandlingID}/medlemsperioder`, perioder);

export const hentMedlemsPerioder = behandlingID =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGSPERIODER}/${behandlingID}/medlemsperioder`);
