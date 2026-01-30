import { describe, it, expect } from "vitest";
import { resetFeiletRespons } from "./actions";
import * as Types from "./types";

describe("feiletRespons actions", () => {
  it("resetFeiletRespons returnerer RESET action", () => {
    expect(resetFeiletRespons()).toEqual({ type: Types.RESET });
  });
});
