import { putAsText } from '../../utils';
import { API_BASE_URL, SAKSFLYT, SOKNADER } from '../../api-constants';

export const videresend = behandlingID => putAsText(`${API_BASE_URL}${SAKSFLYT}/${SOKNADER}/${behandlingID}/videresend`);
