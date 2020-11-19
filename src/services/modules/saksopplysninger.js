import { getAsJson } from '../utils';
import { API_BASE_URL, SAKSOPPLYSNINGER } from '../api-constants';

export const oppfrisk = (behandlingID, options = {}) => {
  const params = Object.keys(options).map(key => `${key}=${options[key]}`).join('&');
  return getAsJson(`${API_BASE_URL}${SAKSOPPLYSNINGER}/oppfriskning/${behandlingID}${params ? `?${params}` : ''}`);
};

