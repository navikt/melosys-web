import { getAsJson } from '../../utils';
import { API_BASE_URL, BEHANDLINGER } from '../../api-constants';

export const hentBehandling = behandlingID => getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}`);
