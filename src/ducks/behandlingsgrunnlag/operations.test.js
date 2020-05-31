import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import MKV from '../../melosyskodeverk';

import * as types from './types';
import * as operations from './operations';
import * as KV from '../../kodeverk';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Behandlingsgrunnlag operations', () => {
  let initialState = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

    initialState = {
      form: {
        [KV.Form.SOKNAD]: {
          values: {},
        },
        [KV.Form.INNGANG]: {
          values: {},
        },
        [KV.Form.VURDER_UTPEKING]: {
          values: {},
        },
      },
      behandlinger: {
        data: {
          behandlingID: 4,
          oppsummering: {
            behandlingstema: {
              kode: undefined,
            },
          },
        },
      },
      behandlingsgrunnlag: {
        data: {
          data: {
            juridiskArbeidsgiverNorge: {},
            personOpplysninger: {},
            arbeidUtland: {},
            foretakUtland: {},
            oppholdUtland: {},
            bosted: {},
            arbeidNorge: {},
            selvstendigArbeid: {},
            maritimtArbeid: {},
            soeknadsland: {},
            periode: {},
            arbeidsinntekt: {},
            arbeidsgiversBekreftelse: {},
            overgangsregelbestemmelser: [],
          },
        },
      },
    };
  });

  describe('lagre', () => {
    each([
      MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
      MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG,
      MKV.Koder.behandlinger.behandlingstema.ARBEID_ETT_LAND_ØVRIG,
      MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV,
      MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND,
      MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND,
    ]).it('lagrer soeknadData ved behandlingstema %p', async behandlingstema => {
      initialState.behandlinger.data.oppsummering.behandlingstema.kode = behandlingstema;

      const expectedActions = [
        { type: types.PENDING },
        { type: types.OK, data: {} },
      ];

      const store = mockStore(initialState);

      await store.dispatch(operations.lagre());

      expect(store.getActions()).toEqual(expectedActions);
      expect(fetch).toHaveBeenLastCalledWith(
        '/api/behandlingsgrunnlag/4',
        expect.objectContaining({
          body: JSON.stringify({
            data: {
              juridiskArbeidsgiverNorge: {},
              personOpplysninger: {},
              arbeidUtland: {},
              foretakUtland: {},
              oppholdUtland: {},
              bosted: {},
              arbeidNorge: {},
              selvstendigArbeid: {},
              maritimtArbeid: {},
              soeknadsland: {},
              periode: {},
              arbeidsinntekt: {},
              arbeidsgiversBekreftelse: {},
            },
          }),
        })
      );
    });

    each([
      MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE,
      MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND,
    ]).it('lagrer SedGrunnlagData ved behandlingstema %p', async behandlingstema => {
      initialState.behandlinger.data.oppsummering.behandlingstema.kode = behandlingstema;

      initialState.form[KV.Form.VURDER_UTPEKING].values = {
        overgangsregelbestemmelser: [],
      };

      const expectedActions = [
        { type: types.OPPDATER_BEHANDLINGSGRUNNLAG, dokument: { overgangsregelbestemmelser: [] } },
        { type: types.PENDING },
        { type: types.OK, data: {} },
      ];

      const store = mockStore(initialState);

      await store.dispatch(operations.lagre());

      expect(store.getActions()).toEqual(expectedActions);
      expect(fetch).toHaveBeenLastCalledWith(
        '/api/behandlingsgrunnlag/4',
        expect.objectContaining({
          body: JSON.stringify({
            data: {
              juridiskArbeidsgiverNorge: {},
              personOpplysninger: {},
              arbeidUtland: {},
              foretakUtland: {},
              oppholdUtland: {},
              bosted: {},
              arbeidNorge: {},
              selvstendigArbeid: {},
              maritimtArbeid: {},
              soeknadsland: {},
              periode: {},
              overgangsregelbestemmelser: [],
            },
          }),
        })
      );
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

  describe('hent', () => {
    it('henter behandlingsgrunnlag og lager OK action', async () => {
      const expectedActions = [
        { type: types.PENDING },
        { type: types.OK, data: {} },
      ];

      const store = mockStore(initialState);

      await store.dispatch(operations.hent(4));

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith('/api/behandlingsgrunnlag/4', expect.anything());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('oppdaterPeriode', () => {
    it('lager OPPDATER_PERIODE action', () => {
      const expectedActions = [
        {
          type: types.OPPDATER_PERIODE,
          data: {
            periode: {
              fom: 'fom',
              tom: 'tom',
            },
          },
        },
      ];

      const store = mockStore(initialState);

      store.dispatch(operations.oppdaterPeriode({ tom: 'tom', fom: 'fom' }));

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

  describe('oppdaterState', () => {
    it('lager OPPDATER_BEHANDLINGSGRUNNLAG action', () => {
      initialState.form[KV.Form.SOKNAD].values = {
        foretakUtland: {},
      };
      initialState.form[KV.Form.INNGANG].values = {
        soknadsland: ['DK'],
      };
      const expectedActions = [
        {
          type: types.OPPDATER_BEHANDLINGSGRUNNLAG,
          dokument: {
            foretakUtland: {},
            soknadsland: ['DK'],
          },
        },
      ];

      const store = mockStore(initialState);

      store.dispatch(operations.oppdaterState());

      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
