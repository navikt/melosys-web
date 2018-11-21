import { getAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export async function hentOrganisasjon(orgnr) {
  const URI_ORGANISASJON = `${API_BASE_URL}organisasjoner/?orgnr=${orgnr}`;
  return getAsJson(URI_ORGANISASJON);
}

