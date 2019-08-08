import { postAsJson } from '../../utils';
import { API_BASE_URL, SAKSFLYT, VEDTAK } from '../../api-constants';

// eslint-disable-next-line import/prefer-default-export
export const fatte = (behandlingID, data) => postAsJson(`${API_BASE_URL}${SAKSFLYT}/${VEDTAK}/${behandlingID}`, data);

export const endrePeriode = (behandlingID, data) => postAsJson(`${API_BASE_URL}${SAKSFLYT}/${VEDTAK}/endre/${behandlingID}`, data);
