import { describe, it, expect } from "vitest";
import { erOrgnrLengde, erOrgnrGyldig } from "./organisasjon";

describe("organisasjon utils", () => {
  describe("erOrgnrLengde", () => {
    it("skal returnere true for 9 sifre", () => {
      expect(erOrgnrLengde("123456789")).toBe(true);
    });

    it("skal returnere false for færre enn 9 sifre", () => {
      expect(erOrgnrLengde("12345678")).toBe(false);
      expect(erOrgnrLengde("1234567")).toBe(false);
      expect(erOrgnrLengde("123")).toBe(false);
      expect(erOrgnrLengde("1")).toBe(false);
    });

    it("skal returnere false for flere enn 9 sifre", () => {
      expect(erOrgnrLengde("1234567890")).toBe(false);
      expect(erOrgnrLengde("12345678901")).toBe(false);
    });

    it("skal returnere false for tom streng", () => {
      expect(erOrgnrLengde("")).toBe(false);
    });

    it("skal returnere false for streng med bokstaver", () => {
      expect(erOrgnrLengde("12345678A")).toBe(false);
      expect(erOrgnrLengde("ABC123456")).toBe(false);
      expect(erOrgnrLengde("ABCDEFGHI")).toBe(false);
    });

    it("skal returnere false for streng med spesialtegn", () => {
      expect(erOrgnrLengde("123-456-78")).toBe(false);
      expect(erOrgnrLengde("123 456 78")).toBe(false);
      expect(erOrgnrLengde("123.456.78")).toBe(false);
    });

    it("skal returnere false for streng med mellomrom", () => {
      expect(erOrgnrLengde(" 12345678")).toBe(false);
      expect(erOrgnrLengde("12345678 ")).toBe(false);
      expect(erOrgnrLengde("123 45678")).toBe(false);
    });
  });

  describe("erOrgnrGyldig", () => {
    // Gyldige orgnr (NAV og andre kjente organisasjoner)
    it("skal returnere true for gyldige organisasjonsnummer", () => {
      expect(erOrgnrGyldig("889640782")).toBe(true); // NAV
      expect(erOrgnrGyldig("974760673")).toBe(true); // Skatteetaten
      expect(erOrgnrGyldig("910075918")).toBe(true); // Politiet
      // Fra gamle tester:
      expect(erOrgnrGyldig("810072512")).toBe(true); // Eiken og Torsken
      expect(erOrgnrGyldig("910099035")).toBe(true); // Skarsvåg og Vanse
      expect(erOrgnrGyldig("910104004")).toBe(true); // Granvind og Fedje
      expect(erOrgnrGyldig("910108239")).toBe(true); // Stord og Leknes
    });

    it("skal returnere false for ugyldige organisasjonsnummer (feil kontrollsiffer)", () => {
      expect(erOrgnrGyldig("889640781")).toBe(false); // Siste siffer feil
      expect(erOrgnrGyldig("974760672")).toBe(false); // Siste siffer feil
      expect(erOrgnrGyldig("910075917")).toBe(false); // Siste siffer feil
    });

    it("skal returnere false for orgnr med feil lengde", () => {
      expect(erOrgnrGyldig("12345678")).toBe(false); // 8 sifre
      expect(erOrgnrGyldig("1234567890")).toBe(false); // 10 sifre
    });

    it("skal returnere false for tom streng", () => {
      expect(erOrgnrGyldig("")).toBe(false);
    });

    it("skal returnere false for null", () => {
      expect(erOrgnrGyldig(null)).toBe(false);
    });

    it("skal returnere false for undefined", () => {
      expect(erOrgnrGyldig(undefined)).toBe(false);
    });

    it("skal returnere false for streng med bokstaver", () => {
      expect(erOrgnrGyldig("88964078A")).toBe(false);
      expect(erOrgnrGyldig("ABC123456")).toBe(false);
    });

    it("skal returnere false for streng med spesialtegn", () => {
      expect(erOrgnrGyldig("889-640-782")).toBe(false);
      expect(erOrgnrGyldig("889 640 782")).toBe(false);
    });

    it("skal håndtere kontrollsiffer 0 korrekt", () => {
      // Når Q1 blir 11, skal den settes til 0
      // 000000000 og 999999999 er faktisk gyldige matematisk
      expect(erOrgnrGyldig("999999999")).toBe(true);
      expect(erOrgnrGyldig("000000000")).toBe(true);
    });

    it("skal validere orgnr med repeterende sifre", () => {
      // 111111111 er faktisk gyldig matematisk (kontrollsiffer stemmer)
      expect(erOrgnrGyldig("111111111")).toBe(true);
    });

    it("skal validere testorgnr", () => {
      expect(erOrgnrGyldig("123456785")).toBe(true);
    });
  });

  describe("integrasjonstest", () => {
    it("skal validere lengde før MOD11-beregning", () => {
      // erOrgnrGyldig skal bruke erOrgnrLengde internt
      const kortOrgnr = "1234567";
      expect(erOrgnrGyldig(kortOrgnr)).toBe(false);
      expect(erOrgnrLengde(kortOrgnr)).toBe(false);
    });

    it("skal godta gyldige orgnr som også har korrekt lengde", () => {
      const gyldigOrgnr = "889640782";
      expect(erOrgnrLengde(gyldigOrgnr)).toBe(true);
      expect(erOrgnrGyldig(gyldigOrgnr)).toBe(true);
    });

    it("skal avvise orgnr med korrekt lengde men feil kontrollsiffer", () => {
      const ugyldigOrgnr = "889640781"; // Korrekt lengde, feil kontrollsiffer
      expect(erOrgnrLengde(ugyldigOrgnr)).toBe(true);
      expect(erOrgnrGyldig(ugyldigOrgnr)).toBe(false);
    });
  });
});
