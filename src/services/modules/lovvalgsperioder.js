import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL, LOVVALGSPERIODER } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export const hent = bid => {
  const URI_VURDERING = `${API_BASE_URL}${LOVVALGSPERIODER}/${bid}`;
  return getAsJson(URI_VURDERING);
};

export const send = (bid, body) => {
  const URI_VURDERING = `${API_BASE_URL}${LOVVALGSPERIODER}/${bid}`;
  return postAsJson(URI_VURDERING, body);
};
