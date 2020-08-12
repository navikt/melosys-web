import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as Utils from '../../utils';

import { sokOperations as operations, sokTypes as types } from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('vilkar operations', () => {
  let initialState = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify([]));

    initialState = {
      vilkar: {
        data: [],
      },
      behandlinger: {
        data: {
          behandlingID: 4,
        },
      },
    };
  });

  describe('sok', () => {
    it('søker etter fagsaker med fnr', async () => {
      const expectedActions = [
        { type: types.PENDING },
        { type: types.OK, data: [] },
      ];

      const store = mockStore(initialState);

      const generator = new Utils.testhelpers.Generator();
      const fnr = generator.generateBirthNumber();
      await store.dispatch(operations.sok(fnr));

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith(
        '/api/fagsaker/sok',
        expect.objectContaining({
          body: JSON.stringify({
            ident: fnr,
            saksnummer: null,
          }),
        })
      );
      expect(store.getActions()).toEqual(expect.arrayContaining(expectedActions));
    });

    it('søker etter fagsaker med saksnummer', async () => {
      const expectedActions = [
        { type: types.PENDING },
        { type: types.OK, data: [] },
      ];

      const store = mockStore(initialState);

      const saksnummer = 'MEL-1234';

      await store.dispatch(operations.sok(saksnummer));

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith(
        '/api/fagsaker/sok',
        expect.objectContaining({
          body: JSON.stringify({
            ident: null,
            saksnummer,
          }),
        })
      );
      expect(store.getActions()).toEqual(expect.arrayContaining(expectedActions));
    });
  });
});
