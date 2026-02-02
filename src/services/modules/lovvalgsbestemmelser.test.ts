import { describe, it, expect, vi } from "vitest";
import { getLovvalgsbestemmelser } from "./lovvalgsbestemmelser";

vi.mock("../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue([]),
}));

describe("lovvalgsbestemmelser", () => {
  it("getLovvalgsbestemmelser er en funksjon", () => {
    expect(typeof getLovvalgsbestemmelser).toBe("function");
  });

  it("getLovvalgsbestemmelser returnerer promise", () => {
    const result = getLovvalgsbestemmelser("type", "tema", "behandlingstema", "NO");
    expect(result).toBeInstanceOf(Promise);
  });
});
