import { describe, it, expect, vi } from "vitest";
import { registrerUnntakFraMedlemskap } from "./unntaksregistrering";

vi.mock("../../utils", () => ({
  postAsJson: vi.fn().mockResolvedValue({}),
}));

describe("unntaksregistrering", () => {
  it("registrerUnntakFraMedlemskap returnerer promise", () => {
    expect(registrerUnntakFraMedlemskap(1)).toBeInstanceOf(Promise);
  });
});
