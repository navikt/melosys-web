import { http, HttpResponse } from "msw";
import { createTestStore } from "../test-utils/createTestStore";

// Global MSW server from setupTests.js
declare const mswServer: ReturnType<typeof import("msw/node").setupServer>;

import * as Utils from "../../utils";

import { sokOperations as operations } from "./index";

interface SokState {
  sok: {
    data: any[];
    loading: boolean;
    error: any;
  };
}

describe("sok operations", () => {
  let initialState: SokState;

  beforeEach(() => {
    initialState = {
      sok: {
        data: [],
        loading: false,
        error: null,
      },
    };
  });

  describe("sok", () => {
    it("søker etter fagsaker med fnr", async () => {
      const store = createTestStore(initialState);

      mswServer.use(
        http.post("/api/fagsaker/sok", () => {
          return HttpResponse.json({ fagsakListe: [] });
        }),
      );

      const generator = new Utils.testhelpers.Generator();
      const fnr = generator.generateBirthNumber();
      await store.dispatch(operations.sok(fnr) as any);

      const finalState = store.getState();
      // Expect the structure that the reducer actually creates
      expect(finalState.sok.data).toEqual({ fagsakListe: { fagsakListe: [] } });
    });

    it("søker etter fagsaker med saksnummer", async () => {
      const store = createTestStore(initialState);

      mswServer.use(
        http.post("/api/fagsaker/sok", () => {
          return HttpResponse.json({ fagsakListe: [] });
        }),
      );

      const saksnummer = "MEL-1234";

      await store.dispatch(operations.sok(saksnummer) as any);

      const finalState = store.getState();
      // Expect the structure that the reducer actually creates
      expect(finalState.sok.data).toEqual({ fagsakListe: { fagsakListe: [] } });
    });

    it("søker etter fagsaker med orgnr", async () => {
      const store = createTestStore(initialState);

      mswServer.use(
        http.post("/api/fagsaker/sok", () => {
          return HttpResponse.json({ fagsakListe: [] });
        }),
      );

      const orgnr = "111111111";

      await store.dispatch(operations.sok(orgnr) as any);

      const finalState = store.getState();
      // Expect the structure that the reducer actually creates
      expect(finalState.sok.data).toEqual({ fagsakListe: { fagsakListe: [] } });
    });
  });
});
