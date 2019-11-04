import { API_BASE_URL, SOKNADER } from '../api-constants';

import { getAsJson, postAsJson } from '../utils';

export const hent = behandlingID => getAsJson(`${API_BASE_URL}${SOKNADER}/${behandlingID}`);
export const send = (behandlingID, soknad) => postAsJson(`${API_BASE_URL}${SOKNADER}/${behandlingID}`, soknad);
