import { describe, it, expect } from "vitest";
import { RootState } from "AppTypes";
import * as selectors from "./selectors";
import MKV from "../../melosyskodeverk";

interface MockState {
  sakstype?: any;
}

describe("FagsakerSelectors", () => {
  const lagState = ({ sakstype }: MockState): Partial<RootState> => ({
    fagsaker: {
      data: {
        sakstype,
      },
    },
  });

  describe("SakstypeKodeSelector", () => {
    it("returnerer korrekt sakstypekode", () => {
      const sakstype = { kode: MKV.Koder.sakstyper.EU_EOS };
      const state = lagState({ sakstype });

      expect(selectors.SakstypeKodeSelector(state as RootState)).toBe(MKV.Koder.sakstyper.EU_EOS);
    });
  });
});
