import configureMOckStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { getAsJson, postAsJson, doThenDispatch } from './utils';
import { hent as hentSaksbehandler } from './modules/saksbehandler';

describe('services/utils', () => {
  describe('Fetch api utility wrapper', () => {
    beforeEach(() => {
      fetch.resetMocks();
    });

    test('[GET] med getAsJson', () => {
      const saksbehandler = {
        brukernavn: 'Z991001',
        navn: 'F_Z991001 E_Z991001',
      };
      fetch.mockResponseOnce(JSON.stringify(saksbehandler));

      // assert on the response
      getAsJson('/api/saksbehandler').then(res => {
        expect(res).toEqual(saksbehandler);
      });

      // assert on the times called and arguments given to fetch
      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual('/api/saksbehandler');
    });

    test('[POST] med postAsJson', () => {
      const saksbehandler = {
        brukernavn: 'Z991001',
        navn: 'F_Z991001 E_Z991001',
      };
      fetch.mockResponseOnce(JSON.stringify(saksbehandler));

      // assert on the response
      postAsJson('/api/saksbehandler', saksbehandler).then(res => {
        expect(res).toEqual(saksbehandler);
      });

      // assert on the times called and arguments given to fetch
      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0]).toEqual('/api/saksbehandler');
    });
  });

  describe('Redux mock store', () => {
    const middlewares = [thunk];
    const mockStore = configureMOckStore(middlewares);

    test('Dispatches doThenDispatch method on success fetch request', () => {
      const saksbehandler = {
        brukernavn: 'Z991001',
        navn: 'F_Z991001 E_Z991001',
      };
      fetch.mockResponse(JSON.stringify(saksbehandler));

      const initalState = {};
      const store = mockStore(initalState);

      const duckSaksbehandlerTypes = {
        OK: 'saksbehandler/OK',
      };
      function expectedData() {
        return {
          type: 'saksbehandler/OK',
          data: saksbehandler,
        };
      }
      store
        .dispatch(doThenDispatch(() => hentSaksbehandler(), duckSaksbehandlerTypes))
        .then(() => {
          const actions = store.getActions();
          const receivedData = actions[0];
          expect(receivedData).toEqual(expectedData());
        });
    });
  });
});
