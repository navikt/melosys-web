import { renderHook, act } from "@testing-library/react";

import { useAsyncCallbackState, useCallbackState } from "./useCallbackState";

describe("useCallbackState", () => {
  it("tar imot et callback og lagrer resultatet til state", async () => {
    const sum = (a: number, b: number) => a + b;
    const { result } = renderHook(() => useCallbackState(() => sum(1, 2), 0, []));

    const [state] = result.current;
    expect(state).toBe(3);
  });
});

describe("useAsyncCallbackState", () => {


  it("kaller errorHandler når callback rejectes", async () => {
    const rejectionReason = new Error();
    const rejected = () => Promise.reject(rejectionReason);

    const errorHandler = vi.fn();

    renderHook(() => useAsyncCallbackState(rejected, null, [], errorHandler));

    await act(async () => {});

    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(errorHandler).toHaveBeenLastCalledWith(rejectionReason);
  });
});
