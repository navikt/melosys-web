import { API_BASE_URL, PERSONER } from '../api-constants';

import { getAsJson } from '../utils';

// eslint-disable-next-line import/prefer-default-export
export const hentPerson = fnrdnr => getAsJson(`${API_BASE_URL}${PERSONER}/${fnrdnr}`);

