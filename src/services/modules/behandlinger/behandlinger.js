import { getAsJson } from '../../utils';
import { API_BASE_URL, BEHANDLINGER } from '../../api-constants';

export const hentBehandling = behandlingID => {
  const URI_BEHANDLING = `${API_BASE_URL}${BEHANDLINGER}/${behandlingID}`;
  return getAsJson(URI_BEHANDLING);
};
