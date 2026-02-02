import { describe, it, expect } from "vitest";
import * as Hjelpetekster from "./hjelpetekster";

describe("hjelpetekster", () => {
  it("alle eksporterte arrays er ikke-tomme", () => {
    const arrays = [
      Hjelpetekster.hjelpeteksterUkArt61,
      Hjelpetekster.hjelpeteksterUkArt65,
      Hjelpetekster.hjelpeteksterUkArt73,
      Hjelpetekster.hjelpeteksterUkArt82,
      Hjelpetekster.hjelpeteksterUsArt52,
      Hjelpetekster.hjelpeteksterUsArt54,
      Hjelpetekster.hjelpeteksterUsArt55,
      Hjelpetekster.hjelpeteksterUsArt56,
      Hjelpetekster.hjelpeteksterCaArt62,
      Hjelpetekster.hjelpeteksterCaArt7,
      Hjelpetekster.hjelpeteksterCaArt9,
      Hjelpetekster.hjelpeteksterCaArt10,
      Hjelpetekster.hjelpeteksterAuArt92,
      Hjelpetekster.hjelpeteksterAuArt93,
    ];
    arrays.forEach((arr) => {
      expect(arr.length).toBeGreaterThan(0);
    });
  });

  it("UK Art 6.1 inneholder vilkår om folketrygden og tre år", () => {
    expect(Hjelpetekster.hjelpeteksterUkArt61).toContainEqual(expect.stringContaining("folketrygden"));
    expect(Hjelpetekster.hjelpeteksterUkArt61).toContainEqual(expect.stringContaining("tre år"));
  });

  it("USA Art 5.2 inneholder vilkår om fem år", () => {
    expect(Hjelpetekster.hjelpeteksterUsArt52).toContainEqual(expect.stringContaining("fem år"));
  });

  it("alle elementer er strenger", () => {
    const allArrays = Object.values(Hjelpetekster);
    allArrays.forEach((arr) => {
      arr.forEach((item: string) => {
        expect(typeof item).toBe("string");
      });
    });
  });
});
