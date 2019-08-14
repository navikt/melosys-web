import { getAsJson } from '../../utils';
import { API_BASE_URL, EESSI } from '../../api-constants';

export const hent = bucType => getAsJson(`${API_BASE_URL}${EESSI}/mottakerinstitusjoner/${bucType}`);
