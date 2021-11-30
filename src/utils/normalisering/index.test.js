import { begrensAntallTegn, normalizeDecimal, normalizeInt } from "./index";

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
