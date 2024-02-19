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

  const fellesFelt = {
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
  };

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
            trygdedekning: null,
            representantIUtlandet: {},
            overgangsregelbestemmelser: [],
            ytterligereInformasjon: {},
            ikkeYrkesaktivSituasjontype: null,
            avsenderland: null,
            lovvalgsland: null,
          },
          type: MKV.Koder.mottatteopplysningertyper.SØKNAD_A1_YRKESAKTIVE_EØS,
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
    it("lagrer soeknad eøs felt for mottatteopplysninger SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS", async () => {
      initialState.mottatteOpplysninger.data.type =
        MKV.Koder.mottatteopplysningertyper.SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS;

      const store = mockStore(initialState);
      await store.dispatch(operations.lagre());

      const expectedActions = [{ type: types.PENDING }, { type: types.OK, data: {} }];
      expect(store.getActions()).toEqual(expectedActions);
      expect(fetch).toHaveBeenLastCalledWith(
        "/api/mottatteopplysninger/4",
        expect.objectContaining({
          body: JSON.stringify({
            data: {
              ...fellesFelt,
              loennOgGodtgjoerelse: {},
              arbeidsgiversBekreftelse: {},
              arbeidssituasjonOgOevrig: {},
              utenlandsoppdraget: {},
            },
          }),
        })
      );
    });

    it("lagrer soeknad eøs felt for mottatteopplysninger SØKNAD_A1_YRKESAKTIVE_EØS", async () => {
      initialState.mottatteOpplysninger.data.type = MKV.Koder.mottatteopplysningertyper.SØKNAD_A1_YRKESAKTIVE_EØS;

      const store = mockStore(initialState);
      await store.dispatch(operations.lagre());

      const expectedActions = [{ type: types.PENDING }, { type: types.OK, data: {} }];
      expect(store.getActions()).toEqual(expectedActions);
      expect(fetch).toHaveBeenLastCalledWith(
        "/api/mottatteopplysninger/4",
        expect.objectContaining({
          body: JSON.stringify({
            data: {
              ...fellesFelt,
              loennOgGodtgjoerelse: {},
              arbeidsgiversBekreftelse: {},
              arbeidssituasjonOgOevrig: {},
              utenlandsoppdraget: {},
            },
          }),
        })
      );
    });

    it("lagrer SedGrunnlagData ved mottatteopplysningertype SED", async () => {
      initialState.mottatteOpplysninger.data.type = MKV.Koder.mottatteopplysningertyper.SED;
      initialState.form[KV.Form.VURDER_UTPEKING].values = { overgangsregelbestemmelser: [] };

      const store = mockStore(initialState);
      await store.dispatch(operations.lagre());

      const expectedActions = [
        { type: types.OPPDATER_MOTTATTE_OPPLYSNINGER, dokument: { overgangsregelbestemmelser: [] } },
        { type: types.PENDING },
        { type: types.OK, data: {} },
      ];
      expect(store.getActions()).toEqual(expectedActions);
      expect(fetch).toHaveBeenLastCalledWith(
        "/api/mottatteopplysninger/4",
        expect.objectContaining({
          body: JSON.stringify({
            data: {
              ...fellesFelt,
              overgangsregelbestemmelser: [],
              ytterligereInformasjon: {},
            },
          }),
        })
      );
    });

    it("lagrer SøknadYrkesaktiveNorgeEllerUtenforEØS ved mottatteopplysnignertype SØKNAD_YRKESAKTIVE_NORGE_ELLER_UTENFOR_EØS", async () => {
      initialState.mottatteOpplysninger.data.type =
        MKV.Koder.mottatteopplysningertyper.SØKNAD_YRKESAKTIVE_NORGE_ELLER_UTENFOR_EØS;

      const store = mockStore(initialState);
      await store.dispatch(operations.lagre());

      const expectedActions = [{ type: types.PENDING }, { type: types.OK, data: {} }];
      expect(store.getActions()).toEqual(expectedActions);
      expect(fetch).toHaveBeenLastCalledWith(
        "/api/mottatteopplysninger/4",
        expect.objectContaining({
          body: JSON.stringify({
            data: {
              ...fellesFelt,
              trygdedekning: null,
              representantIUtlandet: {},
            },
          }),
        })
      );
    });

    it("lagrer SøknadIkkeYrkesaktive ved mottatteopplysnignertype SØKNAD_IKKE_YRKESAKTIV", async () => {
      initialState.mottatteOpplysninger.data.type = MKV.Koder.mottatteopplysningertyper.SØKNAD_IKKE_YRKESAKTIV;

      const store = mockStore(initialState);
      await store.dispatch(operations.lagre());

      const expectedActions = [{ type: types.PENDING }, { type: types.OK, data: {} }];
      expect(store.getActions()).toEqual(expectedActions);
      expect(fetch).toHaveBeenLastCalledWith(
        "/api/mottatteopplysninger/4",
        expect.objectContaining({
          body: JSON.stringify({
            data: {
              ...fellesFelt,
              ikkeYrkesaktivSituasjontype: null,
            },
          }),
        })
      );
    });

    it("lagrer AnmodningEllerAttest ved mottatteopplysnignertype ANMODNING_ELLER_ATTEST", async () => {
      initialState.mottatteOpplysninger.data.type = MKV.Koder.mottatteopplysningertyper.ANMODNING_ELLER_ATTEST;

      const store = mockStore(initialState);
      await store.dispatch(operations.lagre());

      const expectedActions = [{ type: types.PENDING }, { type: types.OK, data: {} }];
      expect(store.getActions()).toEqual(expectedActions);
      expect(fetch).toHaveBeenLastCalledWith(
        "/api/mottatteopplysninger/4",
        expect.objectContaining({
          body: JSON.stringify({
            data: {
              ...fellesFelt,
              avsenderland: null,
              lovvalgsland: null,
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
              flereLandUkjentHvilke: true,
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
