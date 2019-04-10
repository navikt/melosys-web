import { postAsJson } from '../utils';
import { API_BASE_URL, SOLSIDEN } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export

export const post = formData => {
  const URI_SOLSIDEN = `${API_BASE_URL}${SOLSIDEN}`;
  return postAsJson(URI_SOLSIDEN, formData);
};

