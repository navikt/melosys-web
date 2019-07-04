import { cachedGetAsJson } from '../utils';
import { API_BASE_URL, ORGANISASJONER } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export const hentOrganisasjon = orgnr => {
  const URI_ORGANISASJON = `${API_BASE_URL}${ORGANISASJONER}/?orgnr=${orgnr}`;
  return cachedGetAsJson(URI_ORGANISASJON);
};

