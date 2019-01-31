import { getAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

const hent = behandlingID => {
  const URI_BEHANDLINGSRESULTAT = `${API_BASE_URL}behandlingsresultat/${behandlingID}`;
  return getAsJson(URI_BEHANDLINGSRESULTAT);
};

export { hent };
