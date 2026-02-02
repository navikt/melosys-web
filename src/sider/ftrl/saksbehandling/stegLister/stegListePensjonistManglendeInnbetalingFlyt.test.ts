import { describe, it, expect } from "vitest";
import { alleStegPensjonistManglendeInnbetalingFlyt } from "./stegListePensjonistManglendeInnbetalingFlyt";

describe("stegListePensjonistManglendeInnbetalingFlyt", () => {
  it("har 7 steg totalt", () => {
    expect(alleStegPensjonistManglendeInnbetalingFlyt).toHaveLength(7);
  });

  it("har riktig rekkefølge av titler", () => {
    const titler = alleStegPensjonistManglendeInnbetalingFlyt.map((s) => s.tittel);
    expect(titler).toEqual([
      "Manglende innbetaling",
      "Inngang",
      "Bestemmelse",
      "Perioder",
      "Trygdeavgift",
      "Vedtak",
      "Vedtak",
    ]);
  });

  it("har kun Manglende innbetaling som aktivt steg", () => {
    const aktive = alleStegPensjonistManglendeInnbetalingFlyt.filter((s) => s.aktivtSteg);
    expect(aktive).toHaveLength(1);
    expect(aktive[0].tittel).toBe("Manglende innbetaling");
  });

  it("har to vedtakSteg", () => {
    const vedtak = alleStegPensjonistManglendeInnbetalingFlyt.filter((s) => s.vedtakSteg);
    expect(vedtak).toHaveLength(2);
    expect(vedtak.map((v) => v.id)).toEqual(["Vedtak", "VedtakOpphoer"]);
  });

  it("har ikke Virksomhet-steg (pensjonist)", () => {
    const virksomhet = alleStegPensjonistManglendeInnbetalingFlyt.filter((s) => s.tittel === "Virksomhet");
    expect(virksomhet).toHaveLength(0);
  });
});
