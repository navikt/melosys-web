import { describe, it, expect } from "vitest";
import { reset } from "./actions";
import * as Types from "./types";

describe("anmodningunntak actions", () => {
  it("reset returnerer RESET action", () => {
    expect(reset()).toEqual({ type: Types.RESET });
  });
});
