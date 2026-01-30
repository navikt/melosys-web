import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import useIsMounted from "./useIsMounted";

describe("useIsMounted", () => {
  it("returnerer true når komponent er montert", () => {
    const { result } = renderHook(() => useIsMounted());
    expect(result.current.current).toBe(true);
  });

  it("returnerer false etter unmount", () => {
    const { result, unmount } = renderHook(() => useIsMounted());
    unmount();
    expect(result.current.current).toBe(false);
  });
});
