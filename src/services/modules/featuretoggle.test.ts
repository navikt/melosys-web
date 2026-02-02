import { describe, it, expect, vi } from "vitest";
import { hent } from "./featuretoggle";

vi.mock("../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
}));

describe("featuretoggle", () => {
  it("hent returnerer promise", () => {
    expect(hent(["feature1", "feature2"])).toBeInstanceOf(Promise);
  });
});
