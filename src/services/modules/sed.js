import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL, SED } from '../api-constants';

export const hentMottakerinstitusjoner = bucType => getAsJson(`${API_BASE_URL}${SED}/mottakerinstitusjoner/${bucType}`);

export const opprettBuc = (behandlingID, bucData) => postAsJson(`${API_BASE_URL}${SED}/opprettbuc/${behandlingID}`, bucData);

export const hentSedUnderArbeid = behandlingID => getAsJson(`${API_BASE_URL}${SED}/sedunderarbeid/${behandlingID}`);
