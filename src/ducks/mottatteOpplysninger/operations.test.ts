import { describe, expect, beforeEach, it } from "vitest";
import { http, HttpResponse } from "msw";
import { createTestStore } from "../test-utils/createTestStore";

import MKV from "../../melosyskodeverk";

import * as KV from "../../kodeverk";
import * as operations from "./operations";

// Global MSW server from setupTests.js
declare const mswServer: ReturnType<typeof import("msw/node").setupServer>;

const { NO, DK } = MKV.Koder.landkoder;

interface TestState {
  form: {
    [key: string]: {
      values: any;
      syncErrors?: any;
    };
  };
  behandlinger: {
    data: {
      behandlingID: number;
      oppsummering: {
        behandlingstema: {
          kode: string | undefined;
        };
      };
    };
  };
  mottatteOpplysninger: {
    data: {
      data: {
        juridiskArbeidsgiverNorge: any;
        personOpplysninger: any;
        foretakUtland: any;
        oppholdUtland: any;
        bosted: any;
        selvstendigArbeid: any;
        soeknadsland: any;
        periode: any;
        arbeidPaaLand: any;
        maritimtArbeid: any[];
        luftfartBaser: any[];
        loennOgGodtgjoerelse: any;
        arbeidsgiversBekreftelse: any;
        arbeidssituasjonOgOevrig: any;
        utenlandsoppdraget: any;
        trygdedekning: any;
        representantIUtlandet: any;
        overgangsregelbestemmelser: any[];
        ytterligereInformasjon: any;
        ikkeYrkesaktivSituasjontype: any;
        avsenderland: any;
        lovvalgsland: any;
      };
      type: string;
    };
    status?: string;
  };
  fagsaker: {
    data: {
      sakstype: {
        kode: string;
      };
    };
  };
}

describe("MottatteOpplysninger operations", () => {
  let initialState: TestState;

  beforeEach(() => {
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

      mswServer.use(
        http.post("/api/mottatteopplysninger/:behandlingId", () => {
          return HttpResponse.json({});
        }),
      );

      const store = createTestStore(initialState);
      await store.dispatch(operations.lagre() as any);

      const finalState = store.getState();
      expect(finalState.mottatteOpplysninger.data).toEqual({});
      expect(finalState.mottatteOpplysninger.status).toBe("OK");
    });

    it("lagrer soeknad eøs felt for mottatteopplysninger SØKNAD_A1_YRKESAKTIVE_EØS", async () => {
      initialState.mottatteOpplysninger.data.type = MKV.Koder.mottatteopplysningertyper.SØKNAD_A1_YRKESAKTIVE_EØS;

      mswServer.use(http.post("/api/mottatteopplysninger/:behandlingId", () => HttpResponse.json({})));

      const store = createTestStore(initialState);
      await store.dispatch(operations.lagre() as any);

      const finalState = store.getState();
      expect(finalState.mottatteOpplysninger.data).toEqual({});
      expect(finalState.mottatteOpplysninger.status).toBe("OK");
    });

    it("lagrer SøknadYrkesaktiveNorgeEllerUtenforEØS ved mottatteopplysnignertype SØKNAD_YRKESAKTIVE_NORGE_ELLER_UTENFOR_EØS", async () => {
      initialState.mottatteOpplysninger.data.type =
        MKV.Koder.mottatteopplysningertyper.SØKNAD_YRKESAKTIVE_NORGE_ELLER_UTENFOR_EØS;

      mswServer.use(http.post("/api/mottatteopplysninger/:behandlingId", () => HttpResponse.json({})));

      const store = createTestStore(initialState);
      await store.dispatch(operations.lagre() as any);

      const finalState = store.getState();
      expect(finalState.mottatteOpplysninger.data).toEqual({});
      expect(finalState.mottatteOpplysninger.status).toBe("OK");
    });

    it("lagrer SøknadIkkeYrkesaktive ved mottatteopplysnignertype SØKNAD_IKKE_YRKESAKTIV", async () => {
      initialState.mottatteOpplysninger.data.type = MKV.Koder.mottatteopplysningertyper.SØKNAD_IKKE_YRKESAKTIV;

      mswServer.use(http.post("/api/mottatteopplysninger/:behandlingId", () => HttpResponse.json({})));

      const store = createTestStore(initialState);
      await store.dispatch(operations.lagre() as any);

      const finalState = store.getState();
      expect(finalState.mottatteOpplysninger.data).toEqual({});
      expect(finalState.mottatteOpplysninger.status).toBe("OK");
    });

    it("lagrer AnmodningEllerAttest ved mottatteopplysnignertype ANMODNING_ELLER_ATTEST", async () => {
      initialState.mottatteOpplysninger.data.type = MKV.Koder.mottatteopplysningertyper.ANMODNING_ELLER_ATTEST;

      mswServer.use(http.post("/api/mottatteopplysninger/:behandlingId", () => HttpResponse.json({})));

      const store = createTestStore(initialState);
      await store.dispatch(operations.lagre() as any);

      const finalState = store.getState();
      expect(finalState.mottatteOpplysninger.data).toEqual({});
      expect(finalState.mottatteOpplysninger.status).toBe("OK");
    });

    it("lager FEILET ved feil i api-kall", async () => {
      mswServer.use(
        http.post("/api/mottatteopplysninger/:behandlingId", () =>
          HttpResponse.json({ message: "Internal Server Error" }, { status: 500 }),
        ),
      );

      const store = createTestStore(initialState);

      await store.dispatch(operations.lagre() as any);

      const finalState = store.getState();
      expect(finalState.mottatteOpplysninger.data).toBeDefined();
      expect(finalState.mottatteOpplysninger.status).toBe("ERROR");
    });
  });

  describe("hent", () => {
    it("henter mottatteOpplysninger og lager OK action", async () => {
      const mockData = {
        brukerID: "12345678901",
        periode: {
          fom: "2024-01-01",
          tom: "2024-12-31",
        },
      };

      mswServer.use(http.get("/api/mottatteopplysninger/:behandlingId", () => HttpResponse.json(mockData)));

      const store = createTestStore(initialState);

      await store.dispatch(operations.hent(4) as any);

      const finalState = store.getState();
      expect(finalState.mottatteOpplysninger.data).toEqual(mockData);
      expect(finalState.mottatteOpplysninger.status).toBe("OK");
    });
  });

  describe("oppdaterPeriode", () => {
    it("oppdaterer periode", () => {
      const store = createTestStore(initialState);

      store.dispatch(operations.oppdaterPeriode({ tom: "tom", fom: "fom" }) as any);

      const finalState = store.getState();
      expect(finalState.mottatteOpplysninger.data.data.periode).toEqual({
        fom: "fom",
        tom: "tom",
      });
    });
  });

  describe("resetState", () => {
    it("reseterer state", () => {
      const stateWithData = {
        ...initialState,
        mottatteOpplysninger: {
          data: { some: "data" },
          status: "ERROR",
        },
      };

      const store = createTestStore(stateWithData);

      store.dispatch(operations.resetState());

      const finalState = store.getState();
      expect(finalState.mottatteOpplysninger.data).toEqual({});
      expect(finalState.mottatteOpplysninger.status).toBe("NOT_STARTED");
    });
  });

  describe("oppdaterState", () => {
    it("oppdaterer state fra form values", () => {
      const store = createTestStore(initialState);

      store.dispatch(operations.oppdaterState() as any);

      const finalState = store.getState();
      expect(finalState.mottatteOpplysninger.data).toBeDefined();
    });
  });

  describe("oppdaterSoeknadsland", () => {
    it("oppdaterer soeknadsland", () => {
      const store = createTestStore(initialState);

      store.dispatch(operations.oppdaterSoeknadsland([DK, NO], true) as any);

      const finalState = store.getState();
      expect(finalState.mottatteOpplysninger.data.data.soeknadsland).toEqual({
        landkoder: [DK, NO],
        flereLandUkjentHvilke: true,
      });
    });
  });
});
