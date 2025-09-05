import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Felles from "./felles";

const feilmeldingMock = {
  form: {
    feilmeldinger: [
      {
        kategori: {
          alvorlighetsgrad: "FEIL",
          beskrivelse: "Kort beskrivelse.",
        },
        alvorlighetsgrad: "FEIL",
        beskrivelse: "Mangler informasjon",
        melding: "Mangler informasjon.",
        skjemaFeltID: "antallMaanederINorge",
      },
    ],
  },
};

describe("Tester felles.js:", () => {
  describe("inneholderFeilmeldinger", () => {
    test("returnerer true ved feilmeldinger", () => {
      expect(Felles.inneholderFeilmeldinger(feilmeldingMock)).toBe(true);
    });

    test("returnerer false hvis ingen feilmeldinger", () => {
      const mockData1 = {};
      const mockData2 = { form: { feilmeldinger: [] } };
      expect(Felles.inneholderFeilmeldinger(mockData1)).toBe(false);
      expect(Felles.inneholderFeilmeldinger(mockData2)).toBe(false);
    });
  });

  describe("byggValideringsObjekt", () => {
    test("returnerer korrekt valideringsobjekt", () => {
      const mockData = feilmeldingMock;
      const forventetData = {
        antallMaanederINorge: "Mangler informasjon.",
      };

      expect(Felles.byggValideringsObjekt(mockData)).toEqual(forventetData);
    });
  });
});
