import { describe, it, expect } from "vitest";
import { resetMedlemskapsperioder } from "./actions";
import * as Types from "./types";

describe("medlemskapsperioder actions", () => {
  it("resetMedlemskapsperioder returnerer RESET action", () => {
    expect(resetMedlemskapsperioder()).toEqual({ type: Types.RESET });
  });
});
