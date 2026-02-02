import { describe, it, expect } from "vitest";
import { resetOppsummertFakta } from "./action";
import * as Types from "./types";

describe("oppsummertfakta action", () => {
  it("resetOppsummertFakta returnerer RESET action", () => {
    expect(resetOppsummertFakta()).toEqual({ type: Types.RESET });
  });
});
