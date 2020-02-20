import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as types from './types';
import * as operations from './operations';
import * as KV from '../../kodeverk';

import MKV from '../../melosyskodeverk';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('utpekingsperioder operations', () => {
  let initialState = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

    initialState = {
      behandlingsgrunnlag: {
        data: {
          data: {
            periode: {
              tom: '',
              fom: '',
            },
          },
        },
      },
      avklartefakta: {
        data: [],
      },
      behandlinger: {
        data: [
          {
            behandlingID: 4,
          },
        ],
      },
      utpekingsperioder: {
        data: [],
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
  });

  describe('OppdaterUtpekingsperioderState', () => {
    it('bygger utpekingsperiode dersom avklartfakta OMFATTES_I_LAND er annet land enn Norge', () => {
      const avklartfakta = {
        avklartefaktaKode: null,
        referanse: KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND,
        fakta: ['CY'],
        subjektID: null,
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      };

      initialState.avklartefakta.data = [avklartfakta];

      const stegState = {
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B1,
        tilleggbestemmelse: MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_4_1,
      };

      const expectedActions = [
        {
          type: types.OPPDATER_UTPEKINGSPERIODER,
          utpekingsperioder: [
            {
              fomDato: initialState.behandlingsgrunnlag.data.data.periode.fom,
              tomDato: initialState.behandlingsgrunnlag.data.data.periode.tom,
              lovvalgsbestemmelse: stegState.lovvalgsbestemmelse,
              tilleggsbestemmelse: stegState.tilleggbestemmelse,
              lovvalgsland: avklartfakta.fakta[0],
            },
          ],
        },
      ];

      const store = mockStore(initialState);

      store.dispatch(operations.oppdaterUtpekingsperioderState(stegState));

      expect(store.getActions()).toEqual(expectedActions);
    });

    it('bygger tom utpekingsperiode dersom avklartfakta OMFATTES_I_LAND er Norge', () => {
      const avklartfakta = {
        avklartefaktaKode: null,
        referanse: KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND,
        fakta: ['NO'],
        subjektID: null,
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      };

      initialState.avklartefakta.data = [avklartfakta];

      const stegState = {
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B1,
        tilleggbestemmelse: MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_4_1,
      };

      const expectedActions = [
        {
          type: types.OPPDATER_UTPEKINGSPERIODER,
          utpekingsperioder: [],
        },
      ];

      const store = mockStore(initialState);

      store.dispatch(operations.oppdaterUtpekingsperioderState(stegState));

      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
