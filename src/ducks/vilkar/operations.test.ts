import { createTestStore } from "../test-utils/createTestStore";

// import MKV from "../../melosyskodeverk"; // TODO: Remove if not needed

import { vilkarOperations as operations } from "./index";

// Type for fetch mock
declare const fetch: {
  resetMocks: () => void;
  mockResponse: (response: string) => void;
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
  });
});
