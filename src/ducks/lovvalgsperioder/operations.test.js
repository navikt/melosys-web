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
      behandlingsgrunnlag: {
        data: {
          periode: { fom: '1234', tom: '4321' },
          soeknadsland: {
            landkoder: [
              'NO',
              'DK',
            ],
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

    it('lager OPPDATER_LOVVALGSPERIODER dersom lovvalgsbestemmelse er valgt', () => {
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

    it('lager OPPDATER_LOVVALGSPERIODER dersom lovvalgsland er valgt', () => {
      const lovvalgsland = MKV.Koder.landkoder.DE;

      const expectedActions = [
        { type: types.OPPDATER_LOVVALGSPERIODER, data: [{ lovvalgsland }] },
      ];

      const store = mockStore({
        ...initialState,
      });

      const stegState = { lovvalgsland };

      store.dispatch(operations.oppdaterLovvalgsperioderState(stegState));

      expect(store.getActions()).toMatchObject(expectedActions);
    });

    it('lager OPPDATER_LOVVALGSPERIODER med tom lovvalgsperiode dersom avklartfakta OMFATTES_I_LAND er et annet land enn Norge', () => {
      const expectedActions = [
        { type: types.OPPDATER_LOVVALGSPERIODER, data: [] },
      ];

      const avklartfakta = {
        avklartefaktaKode: null,
        referanse: KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND,
        fakta: ['CY'],
        subjektID: null,
        begrunnelseKoder: [],
        begrunnelseFritekst: null,
      };

      const store = mockStore({
        ...initialState,
        avklartefakta: {
          data: [avklartfakta],
        },
      });

      const lovvalgsbestemmelse = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009.FO_987_2009_ART14_11;
      const stegState = { lovvalgsbestemmelse };

      store.dispatch(operations.oppdaterLovvalgsperioderState(stegState));

      expect(store.getActions()).toMatchObject(expectedActions);
    });
  });

  it('lager OPPDATER_LOVVALGSPERIODER med tom lovvalgsperiode dersom søker har offentlig tjeneste i ett annet land', () => {
    const expectedActions = [
      { type: types.OPPDATER_LOVVALGSPERIODER, data: [] },
    ];

    const avklartfakta = {
      avklartefaktaKode: null,
      referanse: KV.Koder.avklartefaktaKoder.OFFENTLIG_ARBEID_ANTALL_LAND,
      fakta: [KV.Koder.OffentligArbeidAntallLand.ANNET_LAND_OG_ANNEN_VIRKSOMHET],
      subjektID: null,
      begrunnelseKoder: [],
      begrunnelseFritekst: null,
    };

    const store = mockStore({
      ...initialState,
      avklartefakta: {
        data: [avklartfakta],
      },
    });

    const lovvalgsbestemmelse = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4;
    const stegState = { lovvalgsbestemmelse };

    store.dispatch(operations.oppdaterLovvalgsperioderState(stegState));

    expect(store.getActions()).toMatchObject(expectedActions);
  });

  it('lager OPPDATER_LOVVALGSPERIODER med tom lovvalgsperiode dersom utpeking er avvist', () => {
    const expectedActions = [
      { type: types.OPPDATER_LOVVALGSPERIODER, data: [] },
    ];

    const avklartfakta = {
      avklartefaktaKode: null,
      referanse: KV.Koder.avklartefaktaKoder.UTPEKING_GODKJENT,
      fakta: [KV.Koder.UtpekingAvNorgeGodkjenning.IKKE_GODKJENN],
      subjektID: null,
      begrunnelseKoder: [],
      begrunnelseFritekst: null,
    };

    const store = mockStore({
      ...initialState,
      avklartefakta: {
        data: [avklartfakta],
      },
    });

    const lovvalgsbestemmelse = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009.FO_987_2009_ART14_11;
    const stegState = { lovvalgsbestemmelse };

    store.dispatch(operations.oppdaterLovvalgsperioderState(stegState));

    expect(store.getActions()).toMatchObject(expectedActions);
  });

  it(`lager OPPDATER_LOVVALGSPERIODER med tom lovvalgsperiode dersom lovvalgsbestemmelse er ${MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1}`, () => {
    const expectedActions = [
      { type: types.OPPDATER_LOVVALGSPERIODER, data: [] },
    ];

    const store = mockStore({
      ...initialState,
    });

    const lovvalgsbestemmelse = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1;
    const stegState = { lovvalgsbestemmelse };

    store.dispatch(operations.oppdaterLovvalgsperioderState(stegState));

    expect(store.getActions()).toMatchObject(expectedActions);
  });

  it('lager OPPDATER_LOVVALGSPERIODER med Norge som lovvalgsland dersom søker har offentlig tjeneste i Norge', () => {
    const expectedActions = [
      {
        type: types.OPPDATER_LOVVALGSPERIODER,
        data: [
          {
            lovvalgsland: MKV.Koder.landkoder.NO,
          },
        ],
      },
    ];

    const avklartfakta = {
      avklartefaktaKode: null,
      referanse: KV.Koder.avklartefaktaKoder.OFFENTLIG_ARBEID_ANTALL_LAND,
      fakta: [KV.Koder.OffentligArbeidAntallLand.NORGE_OG_ANNEN_VIRKSOMHET],
      subjektID: null,
      begrunnelseKoder: [],
      begrunnelseFritekst: null,
    };

    const store = mockStore({
      ...initialState,
      avklartefakta: {
        data: [avklartfakta],
      },
    });

    const lovvalgsbestemmelse = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4;
    const stegState = { lovvalgsbestemmelse };

    store.dispatch(operations.oppdaterLovvalgsperioderState(stegState));

    expect(store.getActions()).toMatchObject(expectedActions);
  });

  it('lager OPPDATER_LOVVALGSPERIODER med Norge som lovvalgsland dersom avklartfakta OMFATTES_I_LAND er Norge', () => {
    const expectedActions = [
      {
        type: types.OPPDATER_LOVVALGSPERIODER,
        data: [
          {
            lovvalgsland: MKV.Koder.landkoder.NO,
          },
        ],
      },
    ];

    const avklartfakta = {
      avklartefaktaKode: null,
      referanse: KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND,
      fakta: [MKV.Koder.landkoder.NO],
      subjektID: null,
      begrunnelseKoder: [],
      begrunnelseFritekst: null,
    };

    const store = mockStore({
      ...initialState,
      avklartefakta: {
        data: [avklartfakta],
      },
    });

    const lovvalgsbestemmelse = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4;
    const stegState = { lovvalgsbestemmelse };

    store.dispatch(operations.oppdaterLovvalgsperioderState(stegState));

    expect(store.getActions()).toMatchObject(expectedActions);
  });

  each([
    MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1A,
    MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2B,
    MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_3,
  ]).it('lager OPPDATER_LOVVALGSPERIODER med Norge som lovvalgsland dersom lovvalgsbestemmelse er %p', lovvalgsbestemmelse => {
    const expectedActions = [
      {
        type: types.OPPDATER_LOVVALGSPERIODER,
        data: [
          {
            lovvalgsland: MKV.Koder.landkoder.NO,
          },
        ],
      },
    ];

    const store = mockStore({
      ...initialState,
    });

    const stegState = { lovvalgsbestemmelse };

    store.dispatch(operations.oppdaterLovvalgsperioderState(stegState));

    expect(store.getActions()).toMatchObject(expectedActions);
  });

  it('lager OPPDATER_LOVVALGSPERIODER med tom lovvalgsperiode dersom søker har lønnet arbeid i ett annet land', () => {
    const expectedActions = [
      { type: types.OPPDATER_LOVVALGSPERIODER, data: [] },
    ];

    const avklartfakta = {
      avklartefaktaKode: null,
      referanse: KV.Koder.avklartefaktaKoder.LOENNET_ARBEID_ANTALL_LAND,
      fakta: [KV.Koder.LoennetArbeidAntallLand.ETT_ANNET_LAND],
      subjektID: null,
      begrunnelseKoder: [],
      begrunnelseFritekst: null,
    };

    const store = mockStore({
      ...initialState,
      avklartefakta: {
        data: [avklartfakta],
      },
    });

    const lovvalgsbestemmelse = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009.FO_987_2009_ART14_11;
    const stegState = { lovvalgsbestemmelse };

    store.dispatch(operations.oppdaterLovvalgsperioderState(stegState));

    expect(store.getActions()).toMatchObject(expectedActions);
  });
});
