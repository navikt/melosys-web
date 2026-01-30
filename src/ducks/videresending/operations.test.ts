import { describe, it, expect, vi } from "vitest";
import { send, reset } from "./operations";
import * as Types from "./types";

describe("videresending operations", () => {
  it("send returnerer thunk", () => {
    expect(typeof send("123", {} as any)).toBe("function");
  });

  it("reset dispatcher RESET action", () => {
    const dispatch = vi.fn();
    (reset() as any)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: Types.RESET });
  });
});
