import { renderHook, act } from "@testing-library/react-hooks";

import useFeatureToggle, { Status } from "./useFeatureToggle";

describe("useFeatureToggle", () => {
  it("henter en featuretoggle som er enabled", async () => {
    (fetch as any).mockResponse(
      JSON.stringify({
        testFeature: true,
      })
    );

    const rh = renderHook(() => useFeatureToggle("testFeature"));

    await act(async () => {
      await rh.waitForNextUpdate();
    });

    const [toggleStatus] = rh.result.current;
    expect(toggleStatus).toBe(Status.enabled);
  });

  it("henter en featuretoggle som er disabled", async () => {
    (fetch as any).mockResponse(
      JSON.stringify({
        testFeature: false,
      })
    );

    const rh = renderHook(() => useFeatureToggle("testFeature"));

    await act(async () => {
      await rh.waitForNextUpdate();
    });

    const [toggleStatus] = rh.result.current;
    expect(toggleStatus).toBe(Status.disabled);
  });

  it("toggle har status fetching bare imens den hentes", async () => {
    (fetch as any).mockResponse(
      JSON.stringify({
        testFeature: false,
      })
    );

    const rh = renderHook(() => useFeatureToggle("testFeature"));

    let [toggleStatus] = rh.result.current;
    expect(toggleStatus).toBe(Status.fetching);

    await act(async () => {
      await rh.waitForNextUpdate();
    });

    [toggleStatus] = rh.result.current;
    expect(toggleStatus).not.toBe(Status.fetching);
  });
});
