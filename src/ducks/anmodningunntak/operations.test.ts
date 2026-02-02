import { describe, it, expect, vi } from "vitest";
import { bestill, svar, reset } from "./operations";
import * as Types from "./types";

describe("anmodningunntak operations", () => {
  it("bestill returnerer thunk", () => {
    expect(typeof bestill(1, {} as any)).toBe("function");
  });

  it("svar returnerer thunk", () => {
    expect(typeof svar(1, {} as any)).toBe("function");
  });

  it("reset dispatcher RESET action", () => {
    const dispatch = vi.fn();
    (reset() as any)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: Types.RESET });
  });
});
