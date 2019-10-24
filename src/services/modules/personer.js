import { API_BASE_URL, PERSONER } from '../api-constants';

import { getAsJson, cachedGetAsJson } from '../utils';

// eslint-disable-next-line import/prefer-default-export
export const hentPerson = fnrdnr => getAsJson(`${API_BASE_URL}${PERSONER}/${fnrdnr}`);
export const hentPersonCached = fnrdnr => cachedGetAsJson(`${API_BASE_URL}${PERSONER}/${fnrdnr}`);
