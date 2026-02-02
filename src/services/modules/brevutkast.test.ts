import { describe, it, expect, vi } from "vitest";
import { hentBrevutkast, lagreBrevutkast, oppdaterBrevutkast, slettBrevutkast } from "./brevutkast";

vi.mock("../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue([]),
  postAsJson: vi.fn().mockResolvedValue({}),
  putAsJson: vi.fn().mockResolvedValue({}),
  deleteAsJson: vi.fn().mockResolvedValue({}),
}));

describe("brevutkast", () => {
  it("hentBrevutkast returnerer promise", () => {
    expect(hentBrevutkast(1)).toBeInstanceOf(Promise);
  });

  it("lagreBrevutkast returnerer promise", () => {
    expect(lagreBrevutkast(1, {} as any)).toBeInstanceOf(Promise);
  });

  it("oppdaterBrevutkast returnerer promise", () => {
    expect(oppdaterBrevutkast(1, 2, {} as any)).toBeInstanceOf(Promise);
  });

  it("slettBrevutkast returnerer promise", () => {
    expect(slettBrevutkast(1, 2)).toBeInstanceOf(Promise);
  });
});
