import { describe, expect, it } from "vitest";

import { leggTilTag, matcherSoek, tellTags, TekstblokkOversikt } from "./tekstblokker";

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

  it("søker ikke i innhold (kun tittel og tags)", () => {
    const medInnhold = blokk(
      "Tittel",
      ["tag"],
      "<p>Du er omfattet av norsk <strong>trygdelovgivning</strong> i territorialfarvann.</p>",
    );
    expect(matcherSoek(medInnhold, "territorialfarvann")).toBe(false);
    expect(matcherSoek(medInnhold, "trygdelovgivning")).toBe(false);
    expect(matcherSoek(medInnhold, "tittel")).toBe(true);
    expect(matcherSoek(medInnhold, "tag")).toBe(true);
  });
});

describe("tellTags", () => {
  it("grupperer tags case-insensitivt og beholder første skrivemåte", () => {
    const blokker = [blokk("A", ["USA-avtale"]), blokk("B", ["usa-avtale"]), blokk("C", ["Norge"])];
    const resultat = tellTags(blokker);

    expect(resultat).toContainEqual(["USA-avtale", 2]);
    expect(resultat).toContainEqual(["Norge", 1]);
    expect(resultat).toHaveLength(2);
  });
});

describe("leggTilTag", () => {
  it("legger til tag og bevarer bokstavstørrelse og mellomrom", () => {
    expect(leggTilTag([], "USA-avtale")).toEqual(["USA-avtale"]);
    expect(leggTilTag([], "ny vurdering")).toEqual(["ny vurdering"]);
  });

  it("trimmer ytterkanter og slår sammen gjentatt blanktegn", () => {
    expect(leggTilTag([], "  ny    vurdering  ")).toEqual(["ny vurdering"]);
  });

  it("ignorerer tomt utkast", () => {
    expect(leggTilTag(["usa"], "")).toEqual(["usa"]);
    expect(leggTilTag(["usa"], "   ")).toEqual(["usa"]);
  });

  it("ignorerer duplikat uavhengig av bokstavstørrelse", () => {
    expect(leggTilTag(["USA-avtale"], "usa-avtale")).toEqual(["USA-avtale"]);
  });

  it("endrer ikke den opprinnelige lista", () => {
    const original = ["usa"];
    leggTilTag(original, "avslag");
    expect(original).toEqual(["usa"]);
  });
});
