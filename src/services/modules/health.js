import { getAsJson } from '../utils';

// eslint-disable-next-line import/prefer-default-export
export function health() {
  const URI_HEALTH = '/melosys/internal/health/';
  return getAsJson(URI_HEALTH);
}

