import { describe, it, expect } from "vitest";
import Soknadsland from "./soknadsland";

describe("Soknadsland", () => {
  it("returnerer tom string for null land", () => {
    expect(Soknadsland({ land: null as any })).toBe("");
  });

  it("returnerer tekst for flereLandUkjentHvilke", () => {
    const result = Soknadsland({
      land: { landkoder: [], flereLandUkjentHvilke: true },
    });
    expect(result).toBe("Flere land. Ikke kjent hvilke.");
  });

  it("returnerer bindestrek for tom landkoder-liste", () => {
    const result = Soknadsland({
      land: { landkoder: [], flereLandUkjentHvilke: false },
    });
    expect(result).toBe("-");
  });

  it("returnerer kommaseparerte landkoder", () => {
    const result = Soknadsland({
      land: { landkoder: ["NO", "SE"], flereLandUkjentHvilke: false },
    });
    expect(result).toBe("NO, SE");
  });

  it("mapper til fullt navn når visFulltNavn er true", () => {
    const kodeverk = [
      { kode: "NO", term: "Norge" },
      { kode: "SE", term: "Sverige" },
    ] as any;
    const result = Soknadsland({
      land: { landkoder: ["NO", "SE"], flereLandUkjentHvilke: false },
      visFulltNavn: true,
      landkoderKodeverk: kodeverk,
    });
    expect(result).toBe("Norge, Sverige");
  });

  it("faller tilbake til landkode når term ikke finnes", () => {
    const result = Soknadsland({
      land: { landkoder: ["XX"], flereLandUkjentHvilke: false },
      visFulltNavn: true,
      landkoderKodeverk: [],
    });
    expect(result).toBe("XX");
  });
});
