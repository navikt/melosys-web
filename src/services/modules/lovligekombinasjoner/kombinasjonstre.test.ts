import { describe, expect, it } from "vitest";

import {
  alleKoderITre,
  behandlingstemaerFor,
  beholdLovlige,
  ryddNedover,
  sakstemaerFor,
  sakstyperITre,
  SakstypeNode,
} from "./kombinasjonstre";

// Et miniatyrtre med de trekkene som betyr noe for kaskaden: samme sakstema under to
// sakstyper, og et behandlingstema som bare finnes under den ene av dem.
const tre: SakstypeNode[] = [
  {
    sakstype: "EU_EOS",
    sakstemaer: [
      { sakstema: "MEDLEMSKAP_LOVVALG", behandlingstemaer: ["UTSENDT_ARBEIDSTAKER", "PENSJONIST"] },
      { sakstema: "UNNTAK", behandlingstemaer: ["ANMODNING_OM_UNNTAK_HOVEDREGEL"] },
    ],
  },
  {
    sakstype: "FTRL",
    sakstemaer: [
      { sakstema: "MEDLEMSKAP_LOVVALG", behandlingstemaer: ["ARBEID_KUN_NORGE"] },
      { sakstema: "TRYGDEAVGIFT", behandlingstemaer: ["YRKESAKTIV"] },
    ],
  },
];

describe("sakstyperITre", () => {
  it("gir sakstypene i treet", () => {
    expect(sakstyperITre(tre)).toEqual(["EU_EOS", "FTRL"]);
  });
});

describe("sakstemaerFor", () => {
  it("uten valgt sakstype gjelder avgrensningen alle, så alle sakstemaer er aktuelle", () => {
    expect(sakstemaerFor(tre, [])).toEqual(["MEDLEMSKAP_LOVVALG", "UNNTAK", "TRYGDEAVGIFT"]);
  });

  it("begrenser til sakstemaene under den valgte sakstypen", () => {
    expect(sakstemaerFor(tre, ["EU_EOS"])).toEqual(["MEDLEMSKAP_LOVVALG", "UNNTAK"]);
    expect(sakstemaerFor(tre, ["FTRL"])).toEqual(["MEDLEMSKAP_LOVVALG", "TRYGDEAVGIFT"]);
  });

  it("tar unionen over flere valgte sakstyper, uten duplikater", () => {
    expect(sakstemaerFor(tre, ["EU_EOS", "FTRL"])).toEqual(["MEDLEMSKAP_LOVVALG", "UNNTAK", "TRYGDEAVGIFT"]);
  });
});

describe("behandlingstemaerFor", () => {
  it("uten valg er alle behandlingstemaer aktuelle", () => {
    expect(behandlingstemaerFor(tre, [], [])).toEqual([
      "UTSENDT_ARBEIDSTAKER",
      "PENSJONIST",
      "ANMODNING_OM_UNNTAK_HOVEDREGEL",
      "ARBEID_KUN_NORGE",
      "YRKESAKTIV",
    ]);
  });

  it("begrenses av sakstypen alene", () => {
    expect(behandlingstemaerFor(tre, ["FTRL"], [])).toEqual(["ARBEID_KUN_NORGE", "YRKESAKTIV"]);
  });

  it("begrenses av sakstemaet alene, på tvers av sakstyper", () => {
    expect(behandlingstemaerFor(tre, [], ["MEDLEMSKAP_LOVVALG"])).toEqual([
      "UTSENDT_ARBEIDSTAKER",
      "PENSJONIST",
      "ARBEID_KUN_NORGE",
    ]);
  });

  it("begrenses av sakstype og sakstema sammen", () => {
    expect(behandlingstemaerFor(tre, ["FTRL"], ["MEDLEMSKAP_LOVVALG"])).toEqual(["ARBEID_KUN_NORGE"]);
  });

  // Unionen, ikke snittet: en blokk som gjelder to sakstyper skal kunne avgrenses til et
  // behandlingstema som bare finnes under den ene.
  it("tar unionen over flere valgte sakstyper", () => {
    expect(behandlingstemaerFor(tre, ["EU_EOS", "FTRL"], ["MEDLEMSKAP_LOVVALG"])).toEqual([
      "UTSENDT_ARBEIDSTAKER",
      "PENSJONIST",
      "ARBEID_KUN_NORGE",
    ]);
  });
});

describe("beholdLovlige", () => {
  const kjente = alleKoderITre(tre);

  it("beholder valg som fortsatt er lovlige", () => {
    expect(beholdLovlige(["ARBEID_KUN_NORGE"], behandlingstemaerFor(tre, ["FTRL"], []), kjente)).toEqual([
      "ARBEID_KUN_NORGE",
    ]);
  });

  it("fjerner valg som ikke lenger er lovlige", () => {
    expect(beholdLovlige(["PENSJONIST", "ARBEID_KUN_NORGE"], behandlingstemaerFor(tre, ["FTRL"], []), kjente)).toEqual([
      "ARBEID_KUN_NORGE",
    ]);
  });

  // En avgrensning lagret på et kodeverk treet ikke kjenner skal ikke forsvinne i det
  // stille bare fordi admin åpnet skjemaet.
  it("beholder koder som ikke finnes noe sted i treet", () => {
    expect(beholdLovlige(["UTGAATT_KODE"], behandlingstemaerFor(tre, ["FTRL"], []), kjente)).toEqual(["UTGAATT_KODE"]);
  });
});

describe("ryddNedover", () => {
  it("rydder sakstema og behandlingstema når sakstypen endres", () => {
    const ryddet = ryddNedover(tre, "sakstype", {
      sakstyper: ["FTRL"],
      sakstemaer: ["UNNTAK"],
      behandlingstemaer: ["ANMODNING_OM_UNNTAK_HOVEDREGEL"],
    });

    expect(ryddet.avgrensning).toEqual({ sakstyper: ["FTRL"], sakstemaer: [], behandlingstemaer: [] });
    expect(ryddet.fjernet).toEqual({
      sakstemaer: ["UNNTAK"],
      behandlingstemaer: ["ANMODNING_OM_UNNTAK_HOVEDREGEL"],
    });
  });

  it("rører ikke sakstemaene når det er sakstemaet som ble endret", () => {
    const ryddet = ryddNedover(tre, "sakstema", {
      sakstyper: [],
      sakstemaer: ["TRYGDEAVGIFT"],
      behandlingstemaer: ["PENSJONIST"],
    });

    expect(ryddet.avgrensning.sakstemaer).toEqual(["TRYGDEAVGIFT"]);
    expect(ryddet.fjernet).toEqual({ sakstemaer: [], behandlingstemaer: ["PENSJONIST"] });
  });

  // Et tømt nivå betyr «alle», altså en utvidelse. Det må skilles fra en delvis rydding.
  it("melder fra om nivåer som ble tømt, men ikke om nivåer som beholdt noe", () => {
    const toemt = ryddNedover(tre, "sakstype", {
      sakstyper: ["FTRL"],
      sakstemaer: ["UNNTAK"],
      behandlingstemaer: ["ANMODNING_OM_UNNTAK_HOVEDREGEL"],
    });
    expect(toemt.toemte).toEqual(["sakstema", "behandlingstema"]);

    const delvis = ryddNedover(tre, "sakstype", {
      sakstyper: ["FTRL"],
      sakstemaer: ["MEDLEMSKAP_LOVVALG", "UNNTAK"],
      behandlingstemaer: [],
    });
    expect(delvis.avgrensning.sakstemaer).toEqual(["MEDLEMSKAP_LOVVALG"]);
    expect(delvis.toemte).toEqual([]);
  });

  it("er en identitet uten tre, slik at kallere slipper egen sjekk", () => {
    const avgrensning = {
      sakstyper: ["EU_EOS"],
      sakstemaer: ["UNNTAK"],
      behandlingstemaer: ["ARBEID_KUN_NORGE"],
    };

    const ryddet = ryddNedover([], "sakstype", avgrensning);

    expect(ryddet.avgrensning).toEqual(avgrensning);
    expect(ryddet.fjernet).toEqual({ sakstemaer: [], behandlingstemaer: [] });
    expect(ryddet.toemte).toEqual([]);
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
