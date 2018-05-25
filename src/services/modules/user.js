import request from '../request';

export default function getUserName(userID) {
  return request(`/api/users/${userID}`).then(user => user.name);
}
