import { describe, it, expect } from "vitest";

import {
  alleLovvalg,
  alleEØSLovvalg,
  unntaksbestemmelser,
  unntaksbestemmelserStorbritanniaKonv,
  unikeAvtaleland,
  unikeAvtalelandKoder,
  landSomErTrygdeavtaleMyndighetslandOgEuEøsLand,
} from "./kodekombinasjoner";

describe("kodekombinasjoner", () => {
  it("alleLovvalg er ikke-tom array", () => {
    expect(alleLovvalg.length).toBeGreaterThan(0);
  });

  it("alleEØSLovvalg er subset av alleLovvalg", () => {
    const alleLovvalgKoder = alleLovvalg.map((k) => k.kode);
    alleEØSLovvalg.forEach((k) => {
      expect(alleLovvalgKoder).toContain(k.kode);
    });
  });

  it("unntaksbestemmelser inneholder ingen duplikater", () => {
    const koder = unntaksbestemmelser.map((k) => k.kode);
    expect(new Set(koder).size).toBe(koder.length);
  });

  it("unntaksbestemmelser inneholder art. 11(3)(b)", () => {
    expect(unntaksbestemmelser.map((k) => k.kode)).toContain("FO_883_2004_ART11_3B");
  });

  it("unntaksbestemmelser er sortert alfabetisk på kode", () => {
    const koder = unntaksbestemmelser.map((k) => k.kode);
    const sortert = [...koder].sort((a, b) => a.localeCompare(b));
    expect(koder).toEqual(sortert);
  });

  it("unntaksbestemmelserStorbritanniaKonv er ikke-tom array", () => {
    expect(unntaksbestemmelserStorbritanniaKonv.length).toBeGreaterThan(0);
  });

  it("unikeAvtaleland har unike koder", () => {
    const koder = unikeAvtaleland.map((k) => k.kode);
    expect(new Set(koder).size).toBe(koder.length);
  });

  it("unikeAvtalelandKoder matcher unikeAvtaleland", () => {
    expect(unikeAvtalelandKoder).toEqual(unikeAvtaleland.map((k) => k.kode));
  });

  it("landSomErTrygdeavtaleMyndighetslandOgEuEøsLand er ikke-tom", () => {
    expect(landSomErTrygdeavtaleMyndighetslandOgEuEøsLand.length).toBeGreaterThan(0);
  });
});
