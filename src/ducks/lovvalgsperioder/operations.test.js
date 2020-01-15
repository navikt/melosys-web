import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import MKV from '../../melosyskodeverk';

import * as types from './types';
import * as operations from './operations';
import * as KV from '../../kodeverk';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Lovvalgsperioder operations', () => {
  let initialState = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

    initialState = {
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
      form: {
        [KV.Form.ARTIKKEL_16_ANMODNING]: {
          values: {
            unntakFraBestemmelse: 'Test',
          },
        },
      },
      anmodningsperioder: {
        data: [
          { sendtUtland: false },
        ],
      },
      lovvalgsperioder: {
        data: [
          { medlemskapsperiodeID: '123' },
        ],
      },
      vilkar: {
        data: [],
      },
      soknad: {
        data: {
          soeknadDokument: {
            periode: { fom: '1234', tom: '4321' },
            soeknadsland: {
              landkoder: [
                'NO',
                'DK',
              ],
            },
          },
        },
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

  describe('oppdaterLovvalgsperioderState', () => {
    it('lager RESET dersom ingen lovvalgsvilkar, lovvalgsbestemmelse eller tilleggbestemmelse er valgt', () => {
      const expectedActions = [
        { type: types.RESET },
      ];

      const store = mockStore(initialState);

      const stegState = {};

      store.dispatch(operations.oppdaterLovvalgsperioderState(stegState));

      expect(store.getActions()).toEqual(expectedActions);
    });

    each([
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1,
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_2,
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A,
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_4_2,
    ]).it('lager OPPDATER_LOVVALGSPERIODER dersom lovvalgsvilkar %p er valgt', lovvalgsvilkarBestemmelse => {
      const lovvalgsvilkar = [
        {
          vilkaar: lovvalgsvilkarBestemmelse,
          oppfylt: true,
          begrunnelseKoder: [],
          begrunnelseFritekst: null,
        },
      ];

      const expectedActions = [
        { type: types.OPPDATER_LOVVALGSPERIODER, data: [{ lovvalgsbestemmelse: lovvalgsvilkarBestemmelse }] },
      ];

      const store = mockStore({
        ...initialState,
        vilkar: {
          data: [
            ...lovvalgsvilkar,
          ],
        },
      });

      const stegState = {};

      store.dispatch(operations.oppdaterLovvalgsperioderState(stegState));

      expect(store.getActions()).toMatchObject(expectedActions);
    });

    it('lager OPPDATER_LOVVALGSPERIODER dersom tilleggbestemmelse er valgt', () => {
      const tilleggbestemmelse = MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5;

      const expectedActions = [
        { type: types.OPPDATER_LOVVALGSPERIODER, data: [{ tilleggBestemmelse: tilleggbestemmelse }] },
      ];

      const store = mockStore({
        ...initialState,
      });

      const stegState = { tilleggbestemmelse };

      store.dispatch(operations.oppdaterLovvalgsperioderState(stegState));

      expect(store.getActions()).toMatchObject(expectedActions);
    });

    it.only('lager OPPDATER_LOVVALGSPERIODER dersom lovvalgsbestemmelse er valgt', () => {
      const lovvalgsbestemmelse = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009.FO_987_2009_ART14_11;

      const expectedActions = [
        { type: types.OPPDATER_LOVVALGSPERIODER, data: [{ lovvalgsbestemmelse }] },
      ];

      const store = mockStore({
        ...initialState,
      });

      const stegState = { lovvalgsbestemmelse };

      store.dispatch(operations.oppdaterLovvalgsperioderState(stegState));

      expect(store.getActions()).toMatchObject(expectedActions);
    });

    it('lager OPPDATER_LOVVALGSPERIODER dersom unntakfrabestemmelse er valgt', () => {
      const unntakfrabestemmelse = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009.FO_987_2009_ART14_11;

      const expectedActions = [
        { type: types.OPPDATER_LOVVALGSPERIODER, data: [{ unntakFraBestemmelse: unntakfrabestemmelse }] },
      ];

      const store = mockStore({
        ...initialState,
      });

      const stegState = { unntakfrabestemmelse };

      store.dispatch(operations.oppdaterLovvalgsperioderState(stegState));

      expect(store.getActions()).toMatchObject(expectedActions);
    });
  });
});
