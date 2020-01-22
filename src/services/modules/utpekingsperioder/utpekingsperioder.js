import { postAsJson, getAsJson } from '../../utils';
import { API_BASE_URL, UTPEKINGSPERIODER } from '../../api-constants';

export const send = (behandlingID, body) => postAsJson(`${API_BASE_URL}${UTPEKINGSPERIODER}/${behandlingID}`, body);

export const hent = behandlingID => getAsJson(`${API_BASE_URL}${UTPEKINGSPERIODER}/${behandlingID}`);
