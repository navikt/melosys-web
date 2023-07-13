import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import MKV from "../../melosyskodeverk";

import * as types from "./types";
import * as operations from "./operations";
import * as KV from "../../kodeverk";

const { NO, DK } = MKV.Koder.landkoder;

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("MottatteOpplysninger operations", () => {
  let initialState = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

    initialState = {
      form: {
        [KV.Form.SOKNAD]: {
          values: {},
          syncErrors: {},
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
      mottatteOpplysninger: {
        data: {
          data: {
            juridiskArbeidsgiverNorge: {},
            personOpplysninger: {},
            foretakUtland: {},
            oppholdUtland: {},
            bosted: {},
            selvstendigArbeid: {},
            soeknadsland: {},
            periode: {},
            arbeidPaaLand: {},
            maritimtArbeid: [],
            luftfartBaser: [],
            loennOgGodtgjoerelse: {},
            arbeidsgiversBekreftelse: {},
            arbeidssituasjonOgOevrig: {},
            utenlandsoppdraget: {},
            trygdedekning: {},
            representantIUtlandet: {},
            overgangsregelbestemmelser: [],
            ytterligereInformasjon: {},
          },
        },
      },
      fagsaker: {
        data: {
          sakstype: {
            kode: "EU_EOS",
          },
        },
      },
    };
  });

  describe("lagre", () => {
    it("lagrer soeknadData for ulike behandlingstema ", async () => {
      const data = [
        MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
        MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG,
        MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY,
        MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV,
        MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND,
        MKV.Koder.behandlinger.behandlingstema.ARBEID_NORGE_BOSATT_ANNET_LAND,
      ];
      data.forEach(async (behandlingstema) => {
        initialState.behandlinger.data.oppsummering.behandlingstema.kode = behandlingstema;

        const expectedActions = [{ type: types.PENDING }, { type: types.OK, data: {} }];

        const store = mockStore(initialState);

        await store.dispatch(operations.lagre());

        expect(store.getActions()).toEqual(expectedActions);
        expect(fetch).toHaveBeenLastCalledWith(
          "/api/mottatteopplysninger/4",
          expect.objectContaining({
            body: JSON.stringify({
              data: {
                juridiskArbeidsgiverNorge: {},
                personOpplysninger: {},
                foretakUtland: {},
                oppholdUtland: {},
                bosted: {},
                selvstendigArbeid: {},
                soeknadsland: {},
                periode: {},
                arbeidPaaLand: {},
                maritimtArbeid: [],
                luftfartBaser: [],
                loennOgGodtgjoerelse: {},
                arbeidsgiversBekreftelse: {},
                arbeidssituasjonOgOevrig: {},
                utenlandsoppdraget: {},
              },
            }),
          })
        );
      });
    });

    it("lagrer SedGrunnlagData ved behandlingstema", async () => {
      const data = [
        MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE,
        MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND,
      ];
      data.forEach(async (behandlingstema) => {
        initialState.behandlinger.data.oppsummering.behandlingstema.kode = behandlingstema;

        initialState.form[KV.Form.VURDER_UTPEKING].values = {
          overgangsregelbestemmelser: [],
        };

        const expectedActions = [
          { type: types.OPPDATER_MOTTATTE_OPPLYSNINGER, dokument: { overgangsregelbestemmelser: [] } },
          { type: types.PENDING },
          { type: types.OK, data: {} },
        ];

        const store = mockStore(initialState);

        await store.dispatch(operations.lagre());

        expect(store.getActions()).toEqual(expectedActions);
        expect(fetch).toHaveBeenLastCalledWith(
          "/api/mottatteopplysninger/4",
          expect.objectContaining({
            body: JSON.stringify({
              data: {
                juridiskArbeidsgiverNorge: {},
                personOpplysninger: {},
                foretakUtland: {},
                oppholdUtland: {},
                bosted: {},
                selvstendigArbeid: {},
                soeknadsland: {},
                periode: {},
                arbeidPaaLand: {},
                maritimtArbeid: [],
                luftfartBaser: [],
                overgangsregelbestemmelser: [],
                ytterligereInformasjon: {},
              },
            }),
          })
        );
      });
    });

    it("lagrer FtrlGrunnlagData ved sakstype FTRL", async () => {
      initialState.fagsaker.data.sakstype.kode = "FTRL";

      const expectedActions = [{ type: types.PENDING }, { type: types.OK, data: {} }];

      const store = mockStore(initialState);

      await store.dispatch(operations.lagre());

      expect(store.getActions()).toEqual(expectedActions);
      expect(fetch).toHaveBeenLastCalledWith(
        "/api/mottatteopplysninger/4",
        expect.objectContaining({
          body: JSON.stringify({
            data: {
              juridiskArbeidsgiverNorge: {},
              personOpplysninger: {},
              foretakUtland: {},
              oppholdUtland: {},
              bosted: {},
              selvstendigArbeid: {},
              soeknadsland: {},
              periode: {},
              arbeidPaaLand: {},
              maritimtArbeid: [],
              luftfartBaser: [],
              loennOgGodtgjoerelse: {},
              arbeidsgiversBekreftelse: {},
              trygdedekning: {},
            },
          }),
        })
      );
    });

    it("lagrer TrygdeavtaleGrunnlagData ved sakstype TRYGDEAVTALE", async () => {
      initialState.fagsaker.data.sakstype.kode = "TRYGDEAVTALE";

      const expectedActions = [{ type: types.PENDING }, { type: types.OK, data: {} }];

      const store = mockStore(initialState);

      await store.dispatch(operations.lagre());

      expect(store.getActions()).toEqual(expectedActions);
      expect(fetch).toHaveBeenLastCalledWith(
        "/api/mottatteopplysninger/4",
        expect.objectContaining({
          body: JSON.stringify({
            data: {
              juridiskArbeidsgiverNorge: {},
              personOpplysninger: {},
              foretakUtland: {},
              oppholdUtland: {},
              bosted: {},
              selvstendigArbeid: {},
              soeknadsland: {},
              periode: {},
              loennOgGodtgjoerelse: {},
              arbeidsgiversBekreftelse: {},
              representantIUtlandet: {},
            },
          }),
        })
      );
    });

    it("lager FEILET ved feil i api-kall", async () => {
      const error = new Error("feil ved kall til Api");
      fetch.resetMocks();
      fetch.mockReject(error);

      const expectedActions = [{ type: types.PENDING }, { type: types.FEILET, data: error.toString() }];

      const store = mockStore(initialState);

      await store.dispatch(operations.lagre());

      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe("hent", () => {
    it("henter mottatteOpplysninger og lager OK action", async () => {
      const expectedActions = [{ type: types.PENDING }, { type: types.OK, data: {} }];

      const store = mockStore(initialState);

      await store.dispatch(operations.hent(4));

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith("/api/mottatteopplysninger/4", expect.anything());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe("oppdaterPeriode", () => {
    it("lager OPPDATER_PERIODE action", () => {
      const expectedActions = [
        {
          type: types.OPPDATER_PERIODE,
          data: {
            periode: {
              fom: "fom",
              tom: "tom",
            },
          },
        },
      ];

      const store = mockStore(initialState);

      store.dispatch(operations.oppdaterPeriode({ tom: "tom", fom: "fom" }));

      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe("resetState", () => {
    it("lager RESET action", () => {
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

  describe("oppdaterState", () => {
    it("lager OPPDATER_MOTTATTE_OPPLYSNINGER action", () => {
      initialState.form[KV.Form.SOKNAD].values = {
        arbeidsforholdUtland: {},
        soknadsland: [DK],
      };
      const expectedActions = [
        {
          type: types.OPPDATER_MOTTATTE_OPPLYSNINGER,
          dokument: {
            arbeidsforholdUtland: {},
            soknadsland: [DK],
          },
        },
      ];

      const store = mockStore(initialState);

      store.dispatch(operations.oppdaterState());

      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe("oppdaterSoeknadsland", () => {
    it("lager OPPDATER_SOEKNADSLAND action", () => {
      const expectedActions = [
        {
          type: types.OPPDATER_SOEKNADSLAND,
          data: {
            soeknadsland: {
              landkoder: [DK, NO],
              erUkjenteEllerAlleEosLand: true,
            },
          },
        },
      ];

      const store = mockStore(initialState);

      store.dispatch(operations.oppdaterSoeknadsland([DK, NO], true));

      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
