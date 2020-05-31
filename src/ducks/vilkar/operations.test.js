import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import MKV from '../../melosyskodeverk';

import { vilkarOperations as operations, vilkarTypes as types } from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('vilkar operations', () => {
  let initialState = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

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

  describe('hent', () => {
    it('henter vilkar og lager OK action', async () => {
      const expectedActions = [
        { type: types.PENDING },
        { type: types.OK, data: {} },
      ];

      const store = mockStore(initialState);
      const bid = 5;

      await store.dispatch(operations.hent(bid));

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith(`/api/vilkaar/${bid}`, expect.anything());
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
      const bid = 5;

      await store.dispatch(operations.hent(bid));

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith(`/api/vilkaar/${bid}`, expect.anything());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('lagre', () => {
    it('filtrerer bort Inngangsvilkaar når vilkaar lagres og lager OK action', async () => {
      initialState.vilkar.data = [
        {
          vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
        },
        {
          vilkaar: MKV.Koder.vilkaar.FO_883_2004_ART12_1,
        },
      ];

      const expectedActions = [
        { type: types.PENDING },
        { type: types.OK, data: {} },
      ];

      const store = mockStore(initialState);

      await store.dispatch(operations.lagre());

      expect(store.getActions()).toEqual(expectedActions);

      expect(fetch).toHaveBeenLastCalledWith(
        '/api/vilkaar/4',
        expect.objectContaining({
          body: JSON.stringify([
            {
              vilkaar: MKV.Koder.vilkaar.FO_883_2004_ART12_1,
            },
          ]),
        })
      );
    });

    it('lager FEILET ved feil i api-kall', async () => {
      const error = new Error('feil ved kall til Api');
      fetch.mockReject(error);

      const expectedActions = [
        { type: types.PENDING },
        { type: types.FEILET, data: error.toString() },
      ];

      const store = mockStore(initialState);

      await store.dispatch(operations.lagre());

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith('/api/vilkaar/4', expect.anything());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('oppdaterState', () => {
    it('lager OPPDATER_BEHANDLINGSGRUNNLAG action', () => {
      const vilkar = [
        { vilkaar: 'test' },
        { vilkaar: 'test2' },
      ];

      const expectedActions = [
        {
          type: types.OPPDATER_VILKAR,
          data: {
            vilkar,
          },
        },
      ];

      const store = mockStore(initialState);

      store.dispatch(operations.oppdaterState(vilkar));

      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('resetState', () => {
    it('lager RESET action', () => {
      const expectedActions = [
        {
          type: types.RESET,
        },
      ];

      const store = mockStore(initialState);

      store.dispatch(operations.resetState());

      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
