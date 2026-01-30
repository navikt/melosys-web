import { describe, it, expect } from "vitest";
import { resetFakturaserier } from "./actions";
import * as Types from "./types";

describe("fakturaserier actions", () => {
  it("resetFakturaserier returnerer RESET action", () => {
    expect(resetFakturaserier()).toEqual({ type: Types.RESET });
  });
});
