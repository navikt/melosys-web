import { getAsJson } from '../utils';
import { API_BASE_URL, OPPRINNELIG_LOVVALGS_PERIODE } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export const hent = bid => {
  const URI_OPPRINNELIG_LOVVALGS_PERIODE = `${API_BASE_URL}${OPPRINNELIG_LOVVALGS_PERIODE}/${bid}`;
  return getAsJson(URI_OPPRINNELIG_LOVVALGS_PERIODE);
};

