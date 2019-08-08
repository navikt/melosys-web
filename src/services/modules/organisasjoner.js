import { cachedGetAsJson } from '../utils';
import { API_BASE_URL, ORGANISASJONER } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export const hentOrganisasjon = orgnr => cachedGetAsJson(`${API_BASE_URL}${ORGANISASJONER}/?orgnr=${orgnr}`);

