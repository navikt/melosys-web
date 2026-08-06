import { describe, expect, it } from "vitest";

import {
  alleKoderITre,
  behandlingstemaerFor,
  behold,
  sakstemaerFor,
  sakstyperITre,
  SakstypeNode,
} from "./kombinasjonstre";

const kode = (k: string) => ({ kode: k, term: k });

// Et miniatyrtre med de trekkene som betyr noe for kaskaden: samme sakstema under to
// sakstyper, og et behandlingstema som bare finnes under den ene av dem.
const tre: SakstypeNode[] = [
  {
    sakstype: kode("EU_EOS"),
    sakstemaer: [
      { sakstema: kode("MEDLEMSKAP_LOVVALG"), behandlingstemaer: [kode("UTSENDT_ARBEIDSTAKER"), kode("PENSJONIST")] },
      { sakstema: kode("UNNTAK"), behandlingstemaer: [kode("ANMODNING_OM_UNNTAK_HOVEDREGEL")] },
    ],
  },
  {
    sakstype: kode("FTRL"),
    sakstemaer: [
      { sakstema: kode("MEDLEMSKAP_LOVVALG"), behandlingstemaer: [kode("ARBEID_KUN_NORGE")] },
      { sakstema: kode("TRYGDEAVGIFT"), behandlingstemaer: [kode("YRKESAKTIV")] },
    ],
  },
];

const koder = (verdier: Array<{ kode: string }>) => verdier.map((v) => v.kode);

describe("sakstyperITre", () => {
  it("gir sakstypene i treet", () => {
    expect(koder(sakstyperITre(tre))).toEqual(["EU_EOS", "FTRL"]);
  });
});

describe("sakstemaerFor", () => {
  it("uten valgt sakstype gjelder avgrensningen alle, så alle sakstemaer er aktuelle", () => {
    expect(koder(sakstemaerFor(tre, []))).toEqual(["MEDLEMSKAP_LOVVALG", "UNNTAK", "TRYGDEAVGIFT"]);
  });

  it("begrenser til sakstemaene under den valgte sakstypen", () => {
    expect(koder(sakstemaerFor(tre, ["EU_EOS"]))).toEqual(["MEDLEMSKAP_LOVVALG", "UNNTAK"]);
    expect(koder(sakstemaerFor(tre, ["FTRL"]))).toEqual(["MEDLEMSKAP_LOVVALG", "TRYGDEAVGIFT"]);
  });

  it("tar unionen over flere valgte sakstyper, uten duplikater", () => {
    expect(koder(sakstemaerFor(tre, ["EU_EOS", "FTRL"]))).toEqual(["MEDLEMSKAP_LOVVALG", "UNNTAK", "TRYGDEAVGIFT"]);
  });
});

describe("behandlingstemaerFor", () => {
  it("uten valg er alle behandlingstemaer aktuelle", () => {
    expect(koder(behandlingstemaerFor(tre, [], []))).toEqual([
      "UTSENDT_ARBEIDSTAKER",
      "PENSJONIST",
      "ANMODNING_OM_UNNTAK_HOVEDREGEL",
      "ARBEID_KUN_NORGE",
      "YRKESAKTIV",
    ]);
  });

  it("begrenses av sakstypen alene", () => {
    expect(koder(behandlingstemaerFor(tre, ["FTRL"], []))).toEqual(["ARBEID_KUN_NORGE", "YRKESAKTIV"]);
  });

  it("begrenses av sakstemaet alene, på tvers av sakstyper", () => {
    expect(koder(behandlingstemaerFor(tre, [], ["MEDLEMSKAP_LOVVALG"]))).toEqual([
      "UTSENDT_ARBEIDSTAKER",
      "PENSJONIST",
      "ARBEID_KUN_NORGE",
    ]);
  });

  it("begrenses av sakstype og sakstema sammen", () => {
    expect(koder(behandlingstemaerFor(tre, ["FTRL"], ["MEDLEMSKAP_LOVVALG"]))).toEqual(["ARBEID_KUN_NORGE"]);
  });

  // Unionen, ikke snittet: en blokk som gjelder to sakstyper skal kunne avgrenses til et
  // behandlingstema som bare finnes under den ene.
  it("tar unionen over flere valgte sakstyper", () => {
    expect(koder(behandlingstemaerFor(tre, ["EU_EOS", "FTRL"], ["MEDLEMSKAP_LOVVALG"]))).toEqual([
      "UTSENDT_ARBEIDSTAKER",
      "PENSJONIST",
      "ARBEID_KUN_NORGE",
    ]);
  });
});

describe("behold", () => {
  const kjente = alleKoderITre(tre);

  it("beholder valg som fortsatt er lovlige", () => {
    expect(behold(["ARBEID_KUN_NORGE"], behandlingstemaerFor(tre, ["FTRL"], []), kjente)).toEqual(["ARBEID_KUN_NORGE"]);
  });

  it("fjerner valg som ikke lenger er lovlige", () => {
    expect(behold(["PENSJONIST", "ARBEID_KUN_NORGE"], behandlingstemaerFor(tre, ["FTRL"], []), kjente)).toEqual([
      "ARBEID_KUN_NORGE",
    ]);
  });

  // En avgrensning lagret på et kodeverk vi ikke lenger kjenner skal ikke forsvinne i det
  // stille bare fordi admin åpnet skjemaet.
  it("beholder ukjente koder", () => {
    expect(behold(["UTGAATT_KODE"], behandlingstemaerFor(tre, ["FTRL"], []), kjente)).toEqual(["UTGAATT_KODE"]);
  });
});

describe("alleKoderITre", () => {
  it("samler koder fra alle tre nivåene", () => {
    const koderITre = alleKoderITre(tre);

    expect(koderITre.has("EU_EOS")).toBe(true);
    expect(koderITre.has("TRYGDEAVGIFT")).toBe(true);
    expect(koderITre.has("YRKESAKTIV")).toBe(true);
    expect(koderITre.has("FINNES_IKKE")).toBe(false);
  });
});
