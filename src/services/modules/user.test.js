/* eslint-disable no-undef */
import * as user from './user';
jest.mock('../../../__mocks__/request');


test('works with promises', () => (
  user.getUserName(4).then(data => expect(data).toEqual('Mark'))
));
