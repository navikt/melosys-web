import { createTestStore } from "../test-utils/createTestStore";

import * as Utils from "../../utils";

import { sokOperations as operations } from "./index";

// Type for fetch mock
declare const fetch: {
  resetMocks: () => void;
  mockResponse: (response: string) => void;
  toHaveBeenCalledTimes: (times: number) => void;
  toHaveBeenLastCalledWith: (url: string, options: any) => void;
};

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
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({ fagsakListe: [] }));

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

      const generator = new Utils.testhelpers.Generator();
      const fnr = generator.generateBirthNumber();
      await store.dispatch(operations.sok(fnr) as any);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith(
        "/api/fagsaker/sok",
        expect.objectContaining({
          body: JSON.stringify({
            ident: fnr,
            saksnummer: null,
            orgnr: null,
          }),
        }),
      );

      const finalState = store.getState();
      expect(finalState.sok.data).toEqual({ fagsakListe: [] });
    });

    it("søker etter fagsaker med saksnummer", async () => {
      const store = createTestStore(initialState);

      const saksnummer = "MEL-1234";

      await store.dispatch(operations.sok(saksnummer) as any);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith(
        "/api/fagsaker/sok",
        expect.objectContaining({
          body: JSON.stringify({
            ident: null,
            saksnummer,
            orgnr: null,
          }),
        }),
      );

      const finalState = store.getState();
      expect(finalState.sok.data).toEqual({ fagsakListe: [] });
    });

    it("søker etter fagsaker med orgnr", async () => {
      const store = createTestStore(initialState);

      const orgnr = "111111111";

      await store.dispatch(operations.sok(orgnr) as any);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenLastCalledWith(
        "/api/fagsaker/sok",
        expect.objectContaining({
          body: JSON.stringify({
            ident: null,
            saksnummer: null,
            orgnr,
          }),
        }),
      );

      const finalState = store.getState();
      expect(finalState.sok.data).toEqual({ fagsakListe: [] });
    });
  });
});
