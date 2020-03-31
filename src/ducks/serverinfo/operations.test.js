import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as types from './types';
import * as operations from './operations';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('serverinfo operations', () => {
  let initialState = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

    initialState = {};
  });

  describe('hent', () => {
    it('henter serverinfo og lager OK action', async () => {
      const expectedActions = [
        { type: types.PENDING },
        { type: types.OK, data: {} },
      ];

      const store = mockStore(initialState);

      await store.dispatch(operations.hent());

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith('/api/serverinfo', expect.anything());
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('lager FEILET ved feil i api-kall', async () => {
      const error = new Error('feil ved kall til Api');
      fetch.mockReject(error);

      const expectedActions = [
        { type: types.PENDING },
        { type: types.FEILET, data: error.toString() },
      ];

      const store = mockStore(initialState);

      await store.dispatch(operations.hent());

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith('/api/serverinfo', expect.anything());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
