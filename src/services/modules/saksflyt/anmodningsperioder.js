import { putAsText } from '../../utils';
import { API_BASE_URL, SAKSFLYT, ANMODNINGSPERIODER } from '../../api-constants';

export const bestill = behandlingID => putAsText(`${API_BASE_URL}${SAKSFLYT}/${ANMODNINGSPERIODER}/${behandlingID}/bestill`);
