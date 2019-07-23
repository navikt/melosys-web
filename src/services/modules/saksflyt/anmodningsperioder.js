import { putAsText } from '../../utils';
import { API_BASE_URL, SAKSFLYT, ANMODNINGSPERIODER } from '../../api-constants';

export const bestill = behandlingID => {
  const URI_SAKSFLYT_ANMODNINGSPERIODER = `${API_BASE_URL}${SAKSFLYT}/${ANMODNINGSPERIODER}/${behandlingID}/bestill`;
  return putAsText(URI_SAKSFLYT_ANMODNINGSPERIODER);
};
