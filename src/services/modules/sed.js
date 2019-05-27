import { getAsJson } from '../utils';
import { API_BASE_URL, SED } from '../api-constants';

export const hentBucSedRelasjoner = () => getAsJson(`${API_BASE_URL}${SED}/bucsedrelasjoner`);

export const hentMottakerinstitusjoner = bucType => getAsJson(`${API_BASE_URL}${SED}/mottakerinstitusjoner/${bucType}`);

export const hentSedUnderArbeid = behandlingID => getAsJson(`${API_BASE_URL}${SED}/sedunderarbeid/${behandlingID}`);
