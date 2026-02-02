import { describe, it, expect, vi } from "vitest";
import { hent, reset } from "./operations";
import * as Types from "./types";

describe("featuretoggle operations", () => {
  it("hent returnerer thunk", () => {
    expect(typeof hent()).toBe("function");
  });

  it("reset dispatcher RESET action", () => {
    const dispatch = vi.fn();
    (reset() as any)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: Types.RESET });
  });
});
