/* eslint-disable no-undef */
import * as user from './user';
jest.mock('../../../__mocks__/request');


it('works with promises', () => {
  expect.assertions(1);
  return user.getUserName(4).then(data => expect(data).toEqual('Mark'));
});
