import { describe, it, expect } from "vitest";
import { alleStegYrkesaktivFlyt } from "./stegListeYrkesaktivFlyt";

describe("stegListeYrkesaktivFlyt", () => {
  it("har 6 steg", () => {
    expect(alleStegYrkesaktivFlyt).toHaveLength(6);
  });

  it("har riktig rekkefølge", () => {
    const titler = alleStegYrkesaktivFlyt.map((s) => s.tittel);
    expect(titler).toEqual(["Inngang", "Virksomhet", "Bestemmelse", "Perioder", "Trygdeavgift", "Vedtak"]);
  });

  it("har stigende stegPosisjon fra 0 til 5", () => {
    alleStegYrkesaktivFlyt.forEach((steg, i) => {
      expect(steg.stegPosisjon).toBe(i);
    });
  });

  it("har kun Inngang som aktivt steg", () => {
    const aktive = alleStegYrkesaktivFlyt.filter((s) => s.aktivtSteg);
    expect(aktive).toHaveLength(1);
    expect(aktive[0].tittel).toBe("Inngang");
  });

  it("har kun Vedtak som vedtakSteg", () => {
    const vedtak = alleStegYrkesaktivFlyt.filter((s) => s.vedtakSteg);
    expect(vedtak).toHaveLength(1);
    expect(vedtak[0].tittel).toBe("Vedtak");
  });
});
