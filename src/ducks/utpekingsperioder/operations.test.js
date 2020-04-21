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
    each([
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B1,
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B2,
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B3,
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B4,
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009.FO_987_2009_ART14_11,
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2B,
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4,
    ]).it('bygger utpekingsperiode dersom avklartfakta OMFATTES_I_LAND er annet land enn Norge og lovvalgsbestemmelse er %p', lovvalgsbestemmelse => {
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
        lovvalgsbestemmelse,
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

    it('bygger utpekingsperiode dersom søker har offentlig tjeneste i annet land', () => {
      const avklartfakta = {
        avklartefaktaKode: null,
        referanse: KV.Koder.avklartefaktaKoder.OFFENTLIG_ARBEID_ANTALL_LAND,
        fakta: [KV.Koder.OffentligArbeidAntallLand.ANNET_LAND_OG_ANNEN_VIRKSOMHET],
        subjektID: null,
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      };

      initialState.avklartefakta.data = [avklartfakta];

      const stegState = {
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4,
        lovvalgsland: MKV.Koder.landkoder.BE,
      };

      const expectedActions = [
        {
          type: types.OPPDATER_UTPEKINGSPERIODER,
          utpekingsperioder: [
            {
              fomDato: initialState.behandlingsgrunnlag.data.data.periode.fom,
              tomDato: initialState.behandlingsgrunnlag.data.data.periode.tom,
              lovvalgsbestemmelse: stegState.lovvalgsbestemmelse,
              tilleggsbestemmelse: undefined,
              lovvalgsland: stegState.lovvalgsland,
            },
          ],
        },
      ];

      const store = mockStore(initialState);

      store.dispatch(operations.oppdaterUtpekingsperioderState(stegState));

      expect(store.getActions()).toEqual(expectedActions);
    });

    it('bygger tom utpekingsperiode dersom søker har offentlig tjeneste i Norge', () => {
      const avklartfakta = {
        avklartefaktaKode: null,
        referanse: KV.Koder.avklartefaktaKoder.OFFENTLIG_ARBEID_ANTALL_LAND,
        fakta: [KV.Koder.OffentligArbeidAntallLand.NORGE_OG_ANNEN_VIRKSOMHET],
        subjektID: null,
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      };

      initialState.avklartefakta.data = [avklartfakta];

      const stegState = {
        lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4,
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
