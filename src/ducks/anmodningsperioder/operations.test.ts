import { http, HttpResponse } from "msw";
import { createTestStore } from "../test-utils/createTestStore";

import * as operations from "./operations";

// Global MSW server from setupTests.js
declare const mswServer: ReturnType<typeof import("msw/node").setupServer>;

interface AnmodningsperiodeData {
  sendtUtland: boolean;
}

interface BehandlingData {
  behandlingID: number;
}

interface TestState {
  behandlinger: {
    data: BehandlingData[];
  };
  anmodningsperioder: {
    data: AnmodningsperiodeData[];
  };
}

describe("Anmodningsperioder operations", () => {
  let initialState: TestState;

  beforeEach(() => {
    initialState = {
      behandlinger: {
        data: [
          {
            behandlingID: 4,
          },
        ],
      },
      anmodningsperioder: {
        data: [{ sendtUtland: false }],
      },
    };
  });

  describe("lagre", () => {
    it("lager PENDING og OK ved normal tilstand", async () => {
      const store = createTestStore(initialState);

      mswServer.use(
        http.post("/api/anmodningsperioder/4", () => {
          return HttpResponse.json({});
        }),
      );

      await store.dispatch(operations.lagre() as any);

      const finalState = store.getState();
      expect(finalState.anmodningsperioder).toBeDefined();
    });

    it("lager FEILET ved feil i api-kall", async () => {
      const store = createTestStore(initialState);

      mswServer.use(
        http.post("/api/anmodningsperioder/4", () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      await store.dispatch(operations.lagre() as any);

      const finalState = store.getState();
      expect(finalState.anmodningsperioder).toBeDefined();
    });

    it("lager ingen actions dersom anmodning er sendt til utlandet", async () => {
      const modifiedState = {
        ...initialState,
        anmodningsperioder: {
          data: initialState.anmodningsperioder.data.map((anmodningsperiode) => ({
            ...anmodningsperiode,
            sendtUtland: true,
          })),
        },
      };

      const store = createTestStore(modifiedState);
      const initialStateSnapshot = store.getState();

      await store.dispatch(operations.lagre() as any);

      const finalState = store.getState();
      expect(finalState.anmodningsperioder).toEqual(initialStateSnapshot.anmodningsperioder);
    });
  });
});
