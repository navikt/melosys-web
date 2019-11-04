import { postAsJson, getAsJson } from '../../utils';
import { API_BASE_URL, ANMODNINGSPERIODER } from '../../api-constants';

export const send = (behandlingID, body) => postAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${behandlingID}`, body);

export const hent = behandlingID => getAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${behandlingID}`);

