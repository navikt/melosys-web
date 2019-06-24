import { postAsJson } from '../../utils';
import { API_BASE_URL, SAKSFLYT, VEDTAK } from '../../api-constants';

// eslint-disable-next-line import/prefer-default-export
export const fatte = (bid, body) => {
  const URI_FATTE_VEDTAK = `${API_BASE_URL}${SAKSFLYT}/${VEDTAK}/${bid}`;
  return postAsJson(URI_FATTE_VEDTAK, body);
};

export const endrePeriode = (bid, body) => {
  const URI_ENDRE_PERIODE = `${API_BASE_URL}${SAKSFLYT}/${VEDTAK}/endre/${bid}`;
  return postAsJson(URI_ENDRE_PERIODE, body);
};
