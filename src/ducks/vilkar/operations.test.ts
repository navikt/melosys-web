import { http, HttpResponse } from "msw";
import { createTestStore } from "../test-utils/createTestStore";

// Global MSW server from setupTests.js
declare const mswServer: ReturnType<typeof import("msw/node").setupServer>;

import MKV from "../../melosyskodeverk";

import { vilkarOperations as operations } from "./index";

interface TestState {
  vilkar: {
    data: any[];
    status: string;
  };
  behandlinger: {
    data: {
      behandlingID: number;
    };
  };
}

describe("vilkar operations", () => {
  let initialState: TestState;

  beforeEach(() => {
    initialState = {
      vilkar: {
        data: [],
        status: "NOT_STARTED",
      },
      behandlinger: {
        data: {
          behandlingID: 4,
        },
      },
    };
  });

  describe("hent", () => {
    it("henter vilkar og lager OK action", async () => {
      const store = createTestStore(initialState);
      const behandlingID = 5;

      mswServer.use(
        http.get(`/api/vilkaar/${behandlingID}`, () => {
          return HttpResponse.json({});
        }),
      );

      await store.dispatch(operations.hent(behandlingID) as any);

      const finalState = store.getState();
      expect(finalState.vilkar.data).toEqual({});
      expect(finalState.vilkar.status).toBe("OK");
    });

    it("lager FEILET ved feil i api-kall", async () => {
      const store = createTestStore(initialState);
      const behandlingID = 5;

      mswServer.use(
        http.get(`/api/vilkaar/${behandlingID}`, () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      await store.dispatch(operations.hent(behandlingID) as any);

      const finalState = store.getState();
      expect(finalState.vilkar.status).toBe("ERROR");
    });
  });

  describe("lagre", () => {
    it("filtrerer bort Inngangsvilkaar når vilkaar lagres og lager OK action", async () => {
      initialState.vilkar.data = [
        {
          vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
        },
        {
          vilkaar: MKV.Koder.vilkaar.FO_883_2004_ART12_1,
        },
      ];

      const store = createTestStore(initialState);

      mswServer.use(
        http.post("/api/vilkaar/4", () => {
          return HttpResponse.json({});
        }),
      );

      await store.dispatch(operations.lagre() as any);

      const finalState = store.getState();
      expect(finalState.vilkar.data).toEqual({});
      expect(finalState.vilkar.status).toBe("OK");
    });

    it("lager FEILET ved feil i api-kall", async () => {
      const store = createTestStore(initialState);

      mswServer.use(
        http.post("/api/vilkaar/4", () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      await store.dispatch(operations.lagre() as any);

      const finalState = store.getState();
      expect(finalState.vilkar.status).toBe("ERROR");
    });
  });

  describe("oppdaterState", () => {
    it("oppdaterer vilkar state", () => {
      const vilkarData = {
        forutgaendeMedlemskap: "true",
        forutgaendeMedlemskap_begrunnelser: [],
        vesentligVirksomhet: "false",
        vesentligVirksomhet_begrunnelser: [],
      };

      const store = createTestStore(initialState);

      store.dispatch(operations.oppdaterState(vilkarData) as any);

      const finalState = store.getState();
      expect(finalState.vilkar.data).toBeInstanceOf(Array);
      expect(finalState.vilkar.data.length).toBeGreaterThan(0);
    });
  });

  describe("resetState", () => {
    it("reseterer vilkar state", () => {
      const stateWithData = {
        ...initialState,
        vilkar: {
          data: [{ vilkaar: "test" }],
          status: "ERROR",
        },
      };

      const store = createTestStore(stateWithData);

      store.dispatch(operations.resetState() as any);

      const finalState = store.getState();
      expect(finalState.vilkar.data).toEqual([]);
      expect(finalState.vilkar.status).toBe("NOT_STARTED");
    });
  });
});
