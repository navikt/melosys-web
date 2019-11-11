import { postAsJson } from '../../utils';
import { API_BASE_URL, SAKSFLYT, VEDTAK } from '../../api-constants';

// eslint-disable-next-line import/prefer-default-export
export const fatt = (behandlingID, data) => postAsJson(`${API_BASE_URL}${SAKSFLYT}/${VEDTAK}/${behandlingID}/fatt`, data);

export const endre = (behandlingID, data) => postAsJson(`${API_BASE_URL}${SAKSFLYT}/${VEDTAK}/${behandlingID}/endre`, data);
