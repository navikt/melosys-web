import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL, LOVVALGSPERIODER } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export const hent = behandlingID => getAsJson(`${API_BASE_URL}${LOVVALGSPERIODER}/${behandlingID}`);

export const send = (behandlingID, data) => postAsJson(`${API_BASE_URL}${LOVVALGSPERIODER}/${behandlingID}`, data);

export const hentOpprinnelig = behandlingID => getAsJson(`${API_BASE_URL}${LOVVALGSPERIODER}/${behandlingID}/opprinnelig`);
