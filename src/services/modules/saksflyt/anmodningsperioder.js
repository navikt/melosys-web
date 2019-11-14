import { postAsJson, putAsText } from '../../utils';
import { API_BASE_URL, SAKSFLYT, ANMODNINGSPERIODER } from '../../api-constants';

export const bestill = (behandlingID, body) => postAsJson(`${API_BASE_URL}${SAKSFLYT}/${ANMODNINGSPERIODER}/${behandlingID}/bestill`, body);
export const svar = behandlingID => putAsText(`${API_BASE_URL}${SAKSFLYT}/${ANMODNINGSPERIODER}/${behandlingID}/svar`);
