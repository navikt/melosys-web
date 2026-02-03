import { describe, it, expect } from "vitest";
import { resetAarsavregning } from "./actions";
import * as Types from "./types";

describe("aarsavregning actions", () => {
  it("resetAarsavregning returnerer RESET action", () => {
    expect(resetAarsavregning()).toEqual({ type: Types.RESET });
  });
});
