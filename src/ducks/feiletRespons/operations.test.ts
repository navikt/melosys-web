import { describe, it, expect } from "vitest";
import { resetFeiletRespons } from "./operations";
import * as Types from "./types";

describe("feiletRespons operations", () => {
  it("resetFeiletRespons returnerer RESET action", () => {
    expect(resetFeiletRespons()).toEqual({ type: Types.RESET });
  });
});
