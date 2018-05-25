/* eslint-disable no-undef */
import * as user from './user';

jest.mock('../request');


it('works with promises', () => {
  expect.assertions(1);
  return user.getUserName(4).then(data => expect(data).toEqual('Mark'));
});
