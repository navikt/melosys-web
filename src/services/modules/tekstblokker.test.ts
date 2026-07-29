import { describe, expect, it } from "vitest";

import { harAlleTags, leggTilTag, matcherSoek, tellTags, tellTagsMedValgte, TekstblokkOversikt } from "./tekstblokker";

const blokk = (tittel: string, tags: string[], innhold = ""): TekstblokkOversikt => ({
  id: 1,
  tittel,
  innhold,
  type: "TEKSTBLOKK",
  tags,
  endretDato: "2026-01-01T00:00:00Z",
  endretAv: "Z123456",
  endretAvNavn: null,
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

describe("tellTagsMedValgte", () => {
  const britiskSkip = blokk("Storbritannia – Arbeid på skip", ["storbritannia", "skip"]);

  it("teller tags i utvalget når ingenting er valgt", () => {
    expect(tellTagsMedValgte([britiskSkip], [])).toContainEqual(["skip", 1]);
  });

  it("tar med valgt tag som finnes i utvalget", () => {
    const resultat = tellTagsMedValgte([britiskSkip], ["storbritannia"]);

    expect(resultat).toContainEqual(["storbritannia", 1]);
    expect(resultat).toHaveLength(2);
  });

  it("tar med valgt tag som ikke gir treff, med antall 0", () => {
    // Uten dette ville taggen forsvinne fra filteret og ikke kunne fjernes igjen.
    const resultat = tellTagsMedValgte([], ["storbritannia", "utsending"]);

    expect(resultat).toEqual([
      ["storbritannia", 0],
      ["utsending", 0],
    ]);
  });

  it("dupliserer ikke valgt tag med annen bokstavstørrelse", () => {
    const medStorForbokstav = blokk("Tittel", ["Storbritannia"]);
    const resultat = tellTagsMedValgte([medStorForbokstav], ["storbritannia"]);

    expect(resultat).toEqual([["Storbritannia", 1]]);
  });
});

describe("harAlleTags", () => {
  const britiskSkip = blokk("Storbritannia (1990) – Arbeid på skip", ["storbritannia", "skip", "innvilgelse"]);
  const australskSkip = blokk("Australia – Arbeid på skip", ["australia", "skip", "innvilgelse"]);

  it("slipper alt gjennom når ingen tags er valgt", () => {
    expect(harAlleTags(britiskSkip, [])).toBe(true);
  });

  it("krever alle valgte tags, ikke bare én", () => {
    expect(harAlleTags(britiskSkip, ["storbritannia", "skip"])).toBe(true);
    expect(harAlleTags(australskSkip, ["storbritannia", "skip"])).toBe(false);
  });

  it("matcher enkelttag", () => {
    expect(harAlleTags(australskSkip, ["skip"])).toBe(true);
    expect(harAlleTags(australskSkip, ["storbritannia"])).toBe(false);
  });

  it("matcher case-insensitivt begge veier", () => {
    const medStorForbokstav = blokk("Tittel", ["USA-avtale", "Skip"]);
    expect(harAlleTags(medStorForbokstav, ["usa-avtale", "skip"])).toBe(true);
    expect(harAlleTags(britiskSkip, ["Storbritannia", "SKIP"])).toBe(true);
  });

  it("gir ingen treff når blokken mangler en av tagene", () => {
    expect(harAlleTags(britiskSkip, ["storbritannia", "utsending"])).toBe(false);
  });

  it("blokk uten tags matcher ingen valgte tags", () => {
    expect(harAlleTags(blokk("Uten tags", []), ["skip"])).toBe(false);
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
