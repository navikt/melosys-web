import { createTestStore } from "../test-utils/createTestStore";

import MKV from "../../melosyskodeverk";

import { vilkarOperations as operations } from "./index";

// Type for fetch mock
declare const fetch: {
  resetMocks: () => void;
  mockResponse: (response: string) => void;
  mockReject: (error: Error) => void;
  toHaveBeenCalledTimes: (times: number) => void;
  toHaveBeenLastCalledWith: (url: string, options: any) => void;
};

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
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

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

      await store.dispatch(operations.hent(behandlingID) as any);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith(`/api/vilkaar/${behandlingID}`, expect.anything());

      const finalState = store.getState();
      expect(finalState.vilkar.data).toEqual({});
      expect(finalState.vilkar.status).toBe("OK");
    });

    it("lager FEILET ved feil i api-kall", async () => {
      const error = new Error("feil ved kall til Api");
      fetch.mockReject(error);

      const store = createTestStore(initialState);
      const behandlingID = 5;

      await store.dispatch(operations.hent(behandlingID) as any);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith(`/api/vilkaar/${behandlingID}`, expect.anything());

      const finalState = store.getState();
      expect(finalState.vilkar.data).toBe(error.toString());
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

      await store.dispatch(operations.lagre() as any);

      expect(fetch).toHaveBeenLastCalledWith(
        "/api/vilkaar/4",
        expect.objectContaining({
          body: JSON.stringify([
            {
              vilkaar: MKV.Koder.vilkaar.FO_883_2004_ART12_1,
            },
          ]),
        }),
      );

      const finalState = store.getState();
      expect(finalState.vilkar.data).toEqual({});
      expect(finalState.vilkar.status).toBe("OK");
    });

    it("lager FEILET ved feil i api-kall", async () => {
      const error = new Error("feil ved kall til Api");
      fetch.mockReject(error);

      const store = createTestStore(initialState);

      await store.dispatch(operations.lagre() as any);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith("/api/vilkaar/4", expect.anything());

      const finalState = store.getState();
      expect(finalState.vilkar.data).toBe(error.toString());
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
