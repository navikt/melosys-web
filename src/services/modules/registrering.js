import { postAsJson } from '../utils';
import { API_BASE_URL, REGISTRERING } from '../api-constants';

export const unntaksperioder = (bid, body) => {
  const URI_REGISTRERING_UNNTAKSPERIODE = `${API_BASE_URL}${REGISTRERING}/${bid}/unntaksperioder`;
  return postAsJson(URI_REGISTRERING_UNNTAKSPERIODE, body);
};
