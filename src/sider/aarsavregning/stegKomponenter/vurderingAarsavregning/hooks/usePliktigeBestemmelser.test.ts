import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("../../../../../services/api", () => ({
  Ftrl: {
    hentPliktigeBestemmelser: vi.fn(),
  },
}));

import * as Api from "../../../../../services/api";
import { usePliktigeBestemmelser } from "./usePliktigeBestemmelser";

describe("usePliktigeBestemmelser", () => {
  it("returnerer bestemmelser ved suksess", async () => {
    vi.mocked(Api.Ftrl.hentPliktigeBestemmelser).mockResolvedValue({
      bestemmelser: ["ART_12", "ART_13"],
    } as any);

    const { result } = renderHook(() => usePliktigeBestemmelser());
    await waitFor(() => expect(result.current).toEqual(["ART_12", "ART_13"]));
  });

  it("returnerer tom liste ved feil", async () => {
    vi.mocked(Api.Ftrl.hentPliktigeBestemmelser).mockRejectedValue(new Error("Feil"));

    const { result } = renderHook(() => usePliktigeBestemmelser());
    await waitFor(() => expect(result.current).toEqual([]));
  });
});
