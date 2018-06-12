import * as User from './user';

describe('user endpoint', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('call /user', () => {
    fetch.mockResponseOnce(JSON.stringify({ data: 'Mark' }));

    // assert on the response
    User.getUserName(4).then(res => {
      expect(res.data).toEqual('Mark');
    });

    // assert on the times called and arguments given to fetch
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0]).toEqual('/api/users/4');
  });
});
