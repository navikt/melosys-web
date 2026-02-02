import { describe, it, expect } from "vitest";
import { alleStegManglendeInnbetalingFlyt } from "./stegListeManglendeInnbetalingFlyt";

describe("stegListeManglendeInnbetalingFlyt", () => {
  it("har 8 steg totalt", () => {
    expect(alleStegManglendeInnbetalingFlyt).toHaveLength(8);
  });

  it("har riktig rekkefølge av titler", () => {
    const titler = alleStegManglendeInnbetalingFlyt.map((s) => s.tittel);
    expect(titler).toEqual([
      "Manglende innbetaling",
      "Inngang",
      "Virksomhet",
      "Bestemmelse",
      "Perioder",
      "Trygdeavgift",
      "Vedtak",
      "Vedtak",
    ]);
  });

  it("har kun Manglende innbetaling som aktivt steg", () => {
    const aktive = alleStegManglendeInnbetalingFlyt.filter((s) => s.aktivtSteg);
    expect(aktive).toHaveLength(1);
    expect(aktive[0].tittel).toBe("Manglende innbetaling");
  });

  it("har to vedtakSteg", () => {
    const vedtak = alleStegManglendeInnbetalingFlyt.filter((s) => s.vedtakSteg);
    expect(vedtak).toHaveLength(2);
    expect(vedtak.map((v) => v.id)).toEqual(["Vedtak", "VedtakOpphoer"]);
  });
});
