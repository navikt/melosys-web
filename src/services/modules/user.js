/* eslint import/prefer-default-export:off */
import { getAsJson } from '../utils';

function getUserName(userID) {
  return getAsJson(`/api/users/${userID}`);
}

export { getUserName };
