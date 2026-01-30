import { describe, it, expect, vi } from "vitest";
import { send } from "./lovvalgsperioder";

vi.mock("../utils", () => ({
  getAsJson: vi.fn(),
  postAsJson: vi.fn(),
  putAsJson: vi.fn(),
  deleteAsJson: vi.fn(),
}));

describe("lovvalgsperioder", () => {
  describe("send", () => {
    it("returnerer tom array uten API-kall når data er tom", async () => {
      const result = await send(1, []);
      expect(result).toEqual([]);
    });
  });
});
