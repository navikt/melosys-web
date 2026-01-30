import { describe, it, expect } from "vitest";
import { konverterMuligMottakerTilKopiMottaker, tomHentMuligeMottakereResDto } from "./dokumenter-v2";
import type { MuligMottaker } from "./dokumenter-v2";

describe("dokumenter-v2", () => {
  describe("konverterMuligMottakerTilKopiMottaker", () => {
    it("konverterer MuligMottaker til KopiMottaker", () => {
      const muligMottaker: MuligMottaker = {
        mottakerNavn: "Test Navn",
        dokumentNavn: "Dokument",
        rolle: "BRUKER",
        orgnr: "123456789",
        aktørId: "1234567890123",
        institusjonID: "inst-1",
      };

      const result = konverterMuligMottakerTilKopiMottaker(muligMottaker);

      expect(result).toEqual({
        rolle: "BRUKER",
        orgnr: "123456789",
        aktørId: "1234567890123",
        institusjonID: "inst-1",
      });
    });

    it("bruker tom string for null aktørId", () => {
      const muligMottaker: MuligMottaker = {
        mottakerNavn: "Test",
        dokumentNavn: "Dok",
        rolle: "BRUKER",
        orgnr: null,
        aktørId: null,
        institusjonID: null,
      };

      const result = konverterMuligMottakerTilKopiMottaker(muligMottaker);

      expect(result.aktørId).toBe("");
      expect(result.orgnr).toBeNull();
      expect(result.institusjonID).toBeNull();
    });
  });

  describe("tomHentMuligeMottakereResDto", () => {
    it("returnerer tom struktur", () => {
      const result = tomHentMuligeMottakereResDto();

      expect(result.hovedMottaker.mottakerNavn).toBe("");
      expect(result.hovedMottaker.rolle).toBe("");
      expect(result.kopiMottakere).toEqual([]);
      expect(result.fasteMottakere).toEqual([]);
    });

    it("hovedMottaker har null for orgnr, aktørId, institusjonID", () => {
      const result = tomHentMuligeMottakereResDto();

      expect(result.hovedMottaker.orgnr).toBeNull();
      expect(result.hovedMottaker.aktørId).toBeNull();
      expect(result.hovedMottaker.institusjonID).toBeNull();
    });
  });
});
