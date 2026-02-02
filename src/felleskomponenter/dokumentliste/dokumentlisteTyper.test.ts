import { describe, it, expect } from "vitest";

import { isSed, isBrev } from "./dokumentlisteTyper";

describe("dokumentlisteTyper", () => {
  const sedDokument = { sedType: "A001", dokumentNavn: "Test SED" } as any;
  const brevDokument = { dokumentData: { brevkode: "B001" }, dokumentNavn: "Test Brev" } as any;

  describe("isSed", () => {
    it("returnerer true for SED-dokument", () => {
      expect(isSed(sedDokument)).toBe(true);
    });

    it("returnerer false for brev-dokument", () => {
      expect(isSed(brevDokument)).toBe(false);
    });
  });

  describe("isBrev", () => {
    it("returnerer true for brev-dokument", () => {
      expect(isBrev(brevDokument)).toBe(true);
    });

    it("returnerer false for SED-dokument", () => {
      expect(isBrev(sedDokument)).toBe(false);
    });
  });
});
