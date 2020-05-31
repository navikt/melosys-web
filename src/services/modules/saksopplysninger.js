import { getAsJson } from '../utils';
import { API_BASE_URL, SAKSOPPLYSNINGER } from '../api-constants';

export const oppfrisk = behandlingID => getAsJson(`${API_BASE_URL}${SAKSOPPLYSNINGER}/oppfriskning/${behandlingID}`);

