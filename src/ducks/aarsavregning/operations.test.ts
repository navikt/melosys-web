import { describe, it, expect } from "vitest";
import { resetAarsavregning } from "./operations";
import * as Types from "./types";

describe("aarsavregning operations", () => {
  it("resetAarsavregning returnerer RESET action", () => {
    expect(resetAarsavregning()).toEqual({ type: Types.RESET });
  });
});
