import { describe, it, expect, vi } from "vitest";
import { hentFolketrygdenKodeverk, hentNavFellesKodeverk, hentLandkoderIso2 } from "./kodeverk";

vi.mock("../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
  cachedGetAsJson: vi.fn().mockResolvedValue({}),
}));

describe("kodeverk", () => {
  it("hentFolketrygdenKodeverk returnerer promise", () => {
    expect(hentFolketrygdenKodeverk()).toBeInstanceOf(Promise);
  });

  it("hentNavFellesKodeverk returnerer promise", () => {
    expect(hentNavFellesKodeverk("LANDKODER")).toBeInstanceOf(Promise);
  });

  it("hentLandkoderIso2 returnerer promise", () => {
    expect(hentLandkoderIso2()).toBeInstanceOf(Promise);
  });
});
