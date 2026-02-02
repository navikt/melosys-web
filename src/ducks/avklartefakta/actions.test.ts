import { describe, it, expect } from "vitest";
import { oppdaterAvklartefaktaState, resetAvklartefaktaState } from "./actions";
import * as Types from "./types";

describe("avklartefakta actions", () => {
  it("resetAvklartefaktaState returnerer RESET action", () => {
    expect(resetAvklartefaktaState()).toEqual({ type: Types.RESET });
  });

  it("oppdaterAvklartefaktaState returnerer OPPDATER_AVKLARTEFAKTA action", () => {
    const data = { key: [{ referanse: "ref1", fakta: "fakta1" }] } as any;
    expect(oppdaterAvklartefaktaState(data)).toEqual({
      type: Types.OPPDATER_AVKLARTEFAKTA,
      data,
    });
  });
});
