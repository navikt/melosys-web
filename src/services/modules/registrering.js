import { postAsJson } from '../utils';
import { API_BASE_URL, REGISTRERING } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export

export async function unntaksperioder(bid, body) {
  const URI_REGISTRERING_UNNTAKSPERIODE = `${API_BASE_URL}${REGISTRERING}/${bid}/unntaksperioder`;
  return postAsJson(URI_REGISTRERING_UNNTAKSPERIODE, body);
}
