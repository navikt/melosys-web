import { getAsJson } from '../../utils';
import { API_BASE_URL, BEHANDLINGSRESULTATER } from '../../api-constants';

export const hent = behandlingID => {
  const URI_BEHANDLINGSRESULTAT = `${API_BASE_URL}${BEHANDLINGSRESULTATER}/${behandlingID}`;
  return getAsJson(URI_BEHANDLINGSRESULTAT);
};

