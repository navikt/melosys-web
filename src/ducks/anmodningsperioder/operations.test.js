import { createTestStore } from "../test-utils/createTestStore";

import * as operations from "./operations";

describe("Anmodningsperioder operations", () => {
  let initialState = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

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

      await store.dispatch(operations.lagre());

      const finalState = store.getState();
      expect(finalState.anmodningsperioder).toBeDefined();
    });

    it("lager FEILET ved feil i api-kall", async () => {
      const error = new Error("feil ved kall til Api");
      fetch.resetMocks();
      fetch.mockReject(error);

      const store = createTestStore(initialState);

      await store.dispatch(operations.lagre());

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

      await store.dispatch(operations.lagre());

      const finalState = store.getState();
      expect(finalState.anmodningsperioder).toEqual(initialStateSnapshot.anmodningsperioder);
    });
  });
});
