/* eslint import/prefer-default-export:off */
import request from '../../../__mocks__/request';

function getUserName(userID) {
  return request(`/api/users/${userID}`).then(user => user.name);
}

export {
  getUserName,
};
