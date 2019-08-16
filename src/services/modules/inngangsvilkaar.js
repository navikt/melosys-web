import { API_BASE_URL, INNGANGSVILKAAR } from '../api-constants';

import { getAsJson } from '../utils';

// eslint-disable-next-line import/prefer-default-export
export const hent = snr => getAsJson(`${API_BASE_URL}${INNGANGSVILKAAR}/${snr}`);

