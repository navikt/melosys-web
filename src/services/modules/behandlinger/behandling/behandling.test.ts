import { describe, it, expect, vi } from "vitest";
import { hentBehandling } from "./behandling";

vi.mock("../../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
}));

describe("behandling", () => {
  it("hentBehandling returnerer promise", () => {
    expect(hentBehandling(1)).toBeInstanceOf(Promise);
  });
});
