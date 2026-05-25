import { describe, expect, it } from "vitest";

import { matcherSoek, TekstblokkOversikt } from "./tekstblokker";

const blokk = (tittel: string, tags: string[], innhold = ""): TekstblokkOversikt => ({
  id: 1,
  tittel,
  innhold,
  type: "TEKSTBLOKK",
  tags,
  endretDato: "2026-01-01T00:00:00Z",
  endretAv: "Z123456",
});

describe("matcherSoek", () => {
  const usaAvslag = blokk("USA – Utsendt arbeidstaker", ["usa", "avslag", "utsending"]);

  it("matcher tom søkestreng", () => {
    expect(matcherSoek(usaAvslag, "")).toBe(true);
    expect(matcherSoek(usaAvslag, "   ")).toBe(true);
  });

  it("matcher på tittel", () => {
    expect(matcherSoek(usaAvslag, "utsendt")).toBe(true);
  });

  it("matcher på tag", () => {
    expect(matcherSoek(usaAvslag, "avslag")).toBe(true);
  });

  it("matcher flere ord på tvers av tittel og tags (AND)", () => {
    expect(matcherSoek(usaAvslag, "USA avslag")).toBe(true);
    expect(matcherSoek(usaAvslag, "usa, avslag")).toBe(true);
    expect(matcherSoek(usaAvslag, "utsendt usa")).toBe(true);
  });

  it("krever at alle ord matcher", () => {
    expect(matcherSoek(usaAvslag, "USA innvilgelse")).toBe(false);
    expect(matcherSoek(usaAvslag, "canada")).toBe(false);
  });

  it("matcher i innhold (HTML strippes)", () => {
    const medInnhold = blokk(
      "Tittel",
      ["tag"],
      "<p>Du er omfattet av norsk <strong>trygdelovgivning</strong> i territorialfarvann.</p>",
    );
    expect(matcherSoek(medInnhold, "territorialfarvann")).toBe(true);
    expect(matcherSoek(medInnhold, "trygdelovgivning")).toBe(true);
    expect(matcherSoek(medInnhold, "tittel territorialfarvann")).toBe(true);
    expect(matcherSoek(medInnhold, "strong")).toBe(false);
  });
});
