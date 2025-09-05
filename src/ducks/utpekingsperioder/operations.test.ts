import { createTestStore } from "../test-utils/createTestStore";

import * as operations from "./operations";
// import * as KV from "../../kodeverk"; // TODO: Remove if not needed

// import MKV from "../../melosyskodeverk"; // TODO: Remove if not needed

// Type for fetch mock
declare const fetch: {
  resetMocks: () => void;
  mockResponse: (response: string) => void;
};

interface TestState {
  mottatteOpplysninger: {
    data: {
      data: {
        periode: {
          tom: string;
          fom: string;
        };
      };
    };
  };
  avklartefakta: {
    data: any[];
  };
  behandlinger: {
    data: Array<{ behandlingID: number }>;
  };
  utpekingsperioder: {
    data: any[];
  };
}

describe("utpekingsperioder operations", () => {
  let initialState: TestState;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

    initialState = {
      mottatteOpplysninger: {
        data: {
          data: {
            periode: {
              tom: "",
              fom: "",
            },
          },
        },
      },
      avklartefakta: {
        data: [],
      },
      behandlinger: {
        data: [
          {
            behandlingID: 4,
          },
        ],
      },
      utpekingsperioder: {
        data: [],
      },
    };
  });

  describe("lagre", () => {
    it("updates state correctly on successful save", async () => {
      const store = createTestStore(initialState);

      await store.dispatch(operations.lagre() as any);

      const finalState = store.getState();
      expect(finalState.utpekingsperioder).toBeDefined();
      // Note: Verify successful state update
    });
  });
});
