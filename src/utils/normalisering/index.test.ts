import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { begrensAntallTegn, normalizeDate, normalizeDecimal, normalizeInt } from "./index";

describe("normalizeDecimal", () => {
  it("returnerer null for tom string", () => {
    expect(normalizeDecimal("", "5")).toBe(null);
  });

  it("erstatter komma med punktum", () => {
    expect(normalizeDecimal("5,", "5")).toBe("5.");
  });

  it("returnerer value hvis value er desimal", () => {
    expect(normalizeDecimal("5.", "5")).toBe("5.");
  });

  it("returnerer value hvis value er heltall", () => {
    expect(normalizeDecimal("5", null)).toBe("5");
  });

  it("returnerer previousvalue hvis value ikke er heltall eller desimal", () => {
    expect(normalizeDecimal("5..", null)).toBe(null);
    expect(normalizeDecimal(".", null)).toBe(null);
    expect(normalizeDecimal(".5", null)).toBe(null);
  });
});

describe("normalizeInt", () => {
  it("returnerer null for tom string", () => {
    expect(normalizeInt("", "5")).toBe(null);
  });

  it("returnerer previousValue hvis value er desimal", () => {
    expect(normalizeInt("5.", "5")).toBe("5");
  });

  it("returnerer value hvis value er heltall", () => {
    expect(normalizeInt("5", null)).toBe("5");
  });
});

describe("normalizeDate", () => {
  it("returnerer formatert dato for gyldig dato-value", () => {
    expect(normalizeDate("010101")).toBe("01.01.2001");
    expect(normalizeDate("01.01.01")).toBe("01.01.2001");
    expect(normalizeDate("01-01-01")).toBe("01.01.2001");
    expect(normalizeDate("01/01/01")).toBe("01.01.2001");
    expect(normalizeDate("01012001")).toBe("01.01.2001");
    expect(normalizeDate("01.01.2001")).toBe("01.01.2001");
    expect(normalizeDate("01-01-2001")).toBe("01.01.2001");
    expect(normalizeDate("01/01/2001")).toBe("01.01.2001");
  });

  it("returnerer value dersom value ikke er gyldig dato", () => {
    expect(normalizeDate("010101010101")).toBe("010101010101");
    expect(normalizeDate("0101010101")).toBe("0101010101");
    expect(normalizeDate("010101010")).toBe("010101010");
    expect(normalizeDate("0101010")).toBe("0101010");
    expect(normalizeDate("01010")).toBe("01010");
    expect(normalizeDate("0101")).toBe("0101");
    expect(normalizeDate("")).toBe("");
  });
});

describe("begrensAntallTegn", () => {
  it("returnerer begrenset antall tegn", () => {
    expect(begrensAntallTegn(5)("12345678911")).toBe("12345");
  });

  it("begrenser ikke dersom antallet tegn ikke er nådd maksimum", () => {
    expect(begrensAntallTegn(10)("Heihei")).toBe("Heihei");
  });

  it("begrenser ikke dersom antallet tegn er like mange som maksimalt tillatte tegn", () => {
    expect(begrensAntallTegn(18)("her har vi 18 tegn")).toBe("her har vi 18 tegn");
  });
});
