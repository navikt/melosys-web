import { getAsJson } from '../utils';
import { API_BASE_URL, SED } from '../api-constants';

export const hentInformasjon = () => getAsJson(`${API_BASE_URL}${SED}/informasjon`);

export const hentSedUnderArbeid = behandlingID => getAsJson(`${API_BASE_URL}${SED}/sedunderarbeid/${behandlingID}`);
