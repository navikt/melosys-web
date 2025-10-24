import { describe, expect, vi, beforeEach } from "vitest";
import Felles from "./felles";
import { formOperations } from "../../../ducks/form";

// Mock formOperations
vi.mock("../../../ducks/form", () => ({
  formOperations: {
    oppdaterAlleSkjemaValideringer: vi.fn(),
  },
}));

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

    test("returnerer tomt objekt når feilmeldinger er tom array", () => {
      const mockData = { form: { feilmeldinger: [] } };
      expect(Felles.byggValideringsObjekt(mockData)).toEqual({});
    });

    test("håndterer flere feilmeldinger", () => {
      const mockData = {
        form: {
          feilmeldinger: [
            { skjemaFeltID: "felt1", melding: "Feil 1" },
            { skjemaFeltID: "felt2", melding: "Feil 2" },
            { skjemaFeltID: "felt3", melding: "Feil 3" },
          ],
        },
      };

      expect(Felles.byggValideringsObjekt(mockData)).toEqual({
        felt1: "Feil 1",
        felt2: "Feil 2",
        felt3: "Feil 3",
      });
    });
  });

  describe("forsokValidering", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test("kaller oppdaterAlleSkjemaValideringer når data inneholder feilmeldinger", () => {
      const mockDispatch = vi.fn();
      const mockOppdaterFn = vi.fn();
      vi.mocked(formOperations.oppdaterAlleSkjemaValideringer).mockReturnValue(mockOppdaterFn);

      Felles.forsokValidering(mockDispatch, feilmeldingMock);

      expect(formOperations.oppdaterAlleSkjemaValideringer).toHaveBeenCalledWith(mockDispatch);
      expect(mockOppdaterFn).toHaveBeenCalledWith({
        antallMaanederINorge: "Mangler informasjon.",
      });
    });

    test("kaller ikke oppdaterAlleSkjemaValideringer når data ikke inneholder feilmeldinger", () => {
      const mockDispatch = vi.fn();
      const mockData = { form: { feilmeldinger: [] } };

      Felles.forsokValidering(mockDispatch, mockData);

      expect(formOperations.oppdaterAlleSkjemaValideringer).not.toHaveBeenCalled();
    });

    test("håndterer manglende form objekt", () => {
      const mockDispatch = vi.fn();
      const mockData = {};

      Felles.forsokValidering(mockDispatch, mockData);

      expect(formOperations.oppdaterAlleSkjemaValideringer).not.toHaveBeenCalled();
    });

    test("kaller oppdaterAlleSkjemaValideringer med riktig valideringsobjekt for flere feil", () => {
      const mockDispatch = vi.fn();
      const mockOppdaterFn = vi.fn();
      vi.mocked(formOperations.oppdaterAlleSkjemaValideringer).mockReturnValue(mockOppdaterFn);

      const mockData = {
        form: {
          feilmeldinger: [
            { skjemaFeltID: "navn", melding: "Navn er påkrevet" },
            { skjemaFeltID: "epost", melding: "Ugyldig e-post" },
          ],
        },
      };

      Felles.forsokValidering(mockDispatch, mockData);

      expect(mockOppdaterFn).toHaveBeenCalledWith({
        navn: "Navn er påkrevet",
        epost: "Ugyldig e-post",
      });
    });
  });
});
