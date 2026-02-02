import { describe, it, expect, vi } from "vitest";
import { oversikt, sendPlukk, tilbakelegg, sok } from "./oppgaver";

vi.mock("../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
  postAsJson: vi.fn().mockResolvedValue({}),
}));

describe("oppgaver", () => {
  it("oversikt returnerer promise", () => {
    expect(oversikt()).toBeInstanceOf(Promise);
  });

  it("sendPlukk returnerer promise", () => {
    expect(sendPlukk({ sakstype: "T", sakstema: "S", behandlingstema: "B" })).toBeInstanceOf(Promise);
  });

  it("tilbakelegg returnerer promise", () => {
    expect(tilbakelegg({ behandlingID: 1, venterPaaDokumentasjon: false })).toBeInstanceOf(Promise);
  });

  it("sok returnerer promise", () => {
    expect(sok({ personIdent: null, orgnr: null })).toBeInstanceOf(Promise);
  });
});
