import { getAsJson, postAsJson } from '../../utils';
import { API_BASE_URL, BEHANDLINGER } from '../../api-constants';

export const sendMedlemsPerioder = (behandlingID, tidligeremedlemsperioder) =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/tidligeremedlemsperioder`, tidligeremedlemsperioder);

export const hentMedlemsPerioder = behandlingID =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/tidligeremedlemsperioder`);
