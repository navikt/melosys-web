import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as types from './types';
import * as operations from './operations';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Anmodningsperioder operations', () => {
  let initialState = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

    initialState = {
      behandlinger: {
        data: [
          {
            behandlingID: 4,
          },
        ],
      },
      anmodningsperioder: {
        data: [
          { sendtUtland: false },
        ],
      },
    };
  });

  describe('lagre', () => {
    it('lager PENDING og OK ved normal tilstand', async () => {
      const expectedActions = [
        { type: types.PENDING },
        { type: types.OK, data: {} },
      ];

      const store = mockStore(initialState);

      await store.dispatch(operations.lagre());

      expect(store.getActions()).toEqual(expectedActions);
    });

    it('lager FEILET ved feil i api-kall', async () => {
      const error = new Error('feil ved kall til Api');
      fetch.resetMocks();
      fetch.mockReject(error);

      const expectedActions = [
        { type: types.PENDING },
        { type: types.FEILET, data: error.toString() },
      ];

      const store = mockStore(initialState);

      await store.dispatch(operations.lagre());

      expect(store.getActions()).toEqual(expectedActions);
    });

    it('lager ingen actions dersom anmodning er sendt til utlandet', async () => {
      initialState.anmodningsperioder.data = initialState.anmodningsperioder.data.map(anmodningsperiode => ({ ...anmodningsperiode, sendtUtland: true }));

      const expectedActions = [];

      const store = mockStore(initialState);

      await store.dispatch(operations.lagre());

      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
