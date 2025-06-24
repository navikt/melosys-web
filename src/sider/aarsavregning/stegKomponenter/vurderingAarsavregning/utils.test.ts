import { beforeEach, describe, expect, it, vi } from "vitest";
import * as Api from "../../../../services/api";
import * as Utils from "../../../../utils";
import {
  beregnSumTilFakturaEllerRefusjon,
  beregnTrygdeavgiftsperioder,
  erBrukerSkattepliktigIHelePerioden,
  hentMedlemskapsFomTomDato,
  mapFeilmelding,
  mapTilInntektskilderProps,
  mapTilSkatteforholdProps,
} from "./utils";

// Mock dependencies
vi.mock("../../../../services/api", () => ({
  Trygdeavgift: {
    beregnTrygdeavgiftsperioder: vi.fn(),
  },
  Aarsavregning: {
    hentAarsavregning: vi.fn(),
  },
}));

vi.mock("../../../../utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../../utils")>();
  return {
    ...actual,
    dato: {
      ...actual.dato,
      formatterDatoTilISO: vi.fn(),
      formatterDatoTilNorsk: vi.fn(),
      sorterEtterNorskFomDato: vi.fn((_a, _b) => 0), // Simplified sort mock
    },
    streng: {
      ...actual.streng,
      uppercaseStrengTilBool: vi.fn(),
      boolTilUppercaseStreng: vi.fn((bool) => (bool ? "JA" : "NEI")),
    },
    _isEmpty: vi.fn(),
  };
});

describe("utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("mapFeilmelding", () => {
    it("returns specific error message for missing trygdeavgiftssats", () => {
      const error = { body: { feilkoder: ["Ingen gjeldende sats finnes for perioden 2013-01-01"] } };

      expect(mapFeilmelding(error)).toBe("Finner ikke trygdeavgiftssats. Melosys har ikke satser for årene før 2014.");
    });

    it("returns original error codes when no specific match", () => {
      const feilkoder = ["Ukjent feil", "Validering feilet"];
      const error = { body: { feilkoder } };

      expect(mapFeilmelding(error)).toEqual(feilkoder);
    });

    it("falls back to error message or raw error", () => {
      expect(mapFeilmelding({ body: { message: "Generisk feil" } })).toBe("Generisk feil");
      expect(mapFeilmelding("String error")).toBe("String error");
    });
  });

  describe("erBrukerSkattepliktigIHelePerioden", () => {
    it("returns true when all periods are skattepliktig", () => {
      const periods = [{ skatteplikttype: "SKATTEPLIKTIG" }, { skatteplikttype: "DELVIS_SKATTEPLIKTIG" }];

      expect(erBrukerSkattepliktigIHelePerioden(periods)).toBe(true);
    });

    it("returns false when any period is ikke skattepliktig", () => {
      const periods = [{ skatteplikttype: "SKATTEPLIKTIG" }, { skatteplikttype: "IKKE_SKATTEPLIKTIG" }];

      expect(erBrukerSkattepliktigIHelePerioden(periods)).toBe(false);
    });
  });

  describe("beregnTrygdeavgiftsperioder", () => {
    const mockOptions = {
      behandlingID: 12345,
      setFeilmelding: vi.fn(),
      setAarsavregningResponse: vi.fn(),
    };

    const mockFormData = {
      skatteforholdsperioder: [{ fomDato: "01.01.2023", tomDato: "31.12.2023", skatteplikttype: "SKATTEPLIKTIG" }],
      inntektskilder: [
        {
          fomDato: "01.01.2023",
          tomDato: "31.12.2023",
          kildetype: "ARBEID",
          arbAvgBetales: "JA",
          bruttoInntekt: "500000",
          erMaanedsbelop: "NEI",
        },
      ],
    };

    beforeEach(() => {
      vi.mocked(Utils.dato.formatterDatoTilISO).mockImplementation((date, fallback) => {
        if (date === "01.01.2023") return "2023-01-01";
        if (date === "31.12.2023") return "2023-12-31";
        return (fallback as string) || (date as string);
      });
      vi.mocked(Utils.streng.uppercaseStrengTilBool).mockImplementation((str) => str === "JA");
    });

    it("excludes inntektskilder for pliktig medlemskap og skattepliktig", async () => {
      const options = { ...mockOptions, medlemskapstypeErPliktig: true };
      vi.mocked(Api.Trygdeavgift.beregnTrygdeavgiftsperioder).mockResolvedValue({} as any);
      vi.mocked(Api.Aarsavregning.hentAarsavregning).mockResolvedValue({} as any);

      await beregnTrygdeavgiftsperioder(mockFormData, options);

      expect(Api.Trygdeavgift.beregnTrygdeavgiftsperioder).toHaveBeenCalledWith(12345, {
        skatteforholdsperioder: [{ fomDato: "2023-01-01", tomDato: "2023-12-31", skatteplikttype: "SKATTEPLIKTIG" }],
        inntektskilder: [], // Empty for mandatory tax-liable members
      });
    });

    it("includes inntektskilder for ikke pliktig medlemskap", async () => {
      const options = { ...mockOptions, medlemskapstypeErPliktig: false };
      vi.mocked(Api.Trygdeavgift.beregnTrygdeavgiftsperioder).mockResolvedValue({} as any);
      vi.mocked(Api.Aarsavregning.hentAarsavregning).mockResolvedValue({} as any);

      await beregnTrygdeavgiftsperioder(mockFormData, options);

      expect(Api.Trygdeavgift.beregnTrygdeavgiftsperioder).toHaveBeenCalledWith(
        12345,
        expect.objectContaining({
          inntektskilder: expect.arrayContaining([
            expect.objectContaining({ type: "ARBEID", avgiftspliktigInntekt: "500000" }),
          ]),
        }),
      );
    });

    it("handles API errors gracefully", async () => {
      const error = { body: { feilkoder: ["API_FEIL"] } };
      vi.mocked(Api.Trygdeavgift.beregnTrygdeavgiftsperioder).mockRejectedValue(error);

      await beregnTrygdeavgiftsperioder(mockFormData, mockOptions);

      expect(mockOptions.setFeilmelding).toHaveBeenCalledWith(["API_FEIL"]);
    });
  });

  describe("helper functions", () => {
    beforeEach(() => {
      vi.mocked(Utils.dato.formatterDatoTilISO).mockImplementation((date) => {
        if (date === "01.01.2023") return "2023-01-01";
        if (date === "31.12.2023") return "2023-12-31";
        return date as string;
      });
      vi.mocked(Utils.dato.formatterDatoTilNorsk).mockImplementation((date) => {
        if (date === "2023-01-01") return "01.01.2023";
        if (date === "2023-12-31") return "31.12.2023";
        return date as string;
      });
    });

    describe("hentMedlemskapsFomTomDato", () => {
      it("extracts date range from membership periods", () => {
        const periods = [{ fomDato: "01.01.2023", tomDato: "31.12.2023" }];
        vi.mocked(Utils._isEmpty).mockReturnValue(false);

        const result = hentMedlemskapsFomTomDato(periods);

        expect(result).toEqual({ fom: "2023-01-01", tom: "2023-12-31" });
      });

      it("returns empty object for empty periods", () => {
        vi.mocked(Utils._isEmpty).mockReturnValue(true);

        expect(hentMedlemskapsFomTomDato([])).toEqual({});
      });
    });

    describe("mapTilSkatteforholdProps", () => {
      it("maps skatteforholdsperioder data correctly", () => {
        const taxPeriods = [{ fomDato: "2023-01-01", tomDato: "2023-12-31", skatteplikttype: "SKATTEPLIKTIG" }];
        vi.mocked(Utils._isEmpty).mockReturnValue(false);
        const result = mapTilSkatteforholdProps(taxPeriods, []);

        expect(result).toEqual([{ fomDato: "01.01.2023", tomDato: "31.12.2023", skatteplikttype: "SKATTEPLIKTIG" }]);
      });

      it("creates default skatteforhold from membership when none provided", () => {
        const membership = [{ fomDato: "01.01.2023", tomDato: "31.12.2023" }];
        vi.mocked(Utils._isEmpty).mockReturnValue(false);

        const result = mapTilSkatteforholdProps(undefined, membership);

        expect(result).toEqual([{ fomDato: "01.01.2023", tomDato: "31.12.2023", skatteplikttype: undefined }]);
      });
    });

    describe("mapTilInntektskilderProps", () => {
      it("maps inntektskilder data correctly", () => {
        const income = [
          {
            fomDato: "2023-01-01",
            tomDato: "2023-12-31",
            type: "ARBEID",
            arbeidsgiversavgiftBetales: true,
            avgiftspliktigInntekt: "500000",
            erMaanedsbelop: false,
          },
        ];
        vi.mocked(Utils._isEmpty).mockReturnValue(false);

        const result = mapTilInntektskilderProps(income, []);

        expect(result).toEqual([
          {
            fomDato: "01.01.2023",
            tomDato: "31.12.2023",
            kildetype: "ARBEID",
            arbAvgBetales: "JA",
            bruttoInntekt: "500000",
            erMaanedsbelop: "NEI",
          },
        ]);
      });

      it("creates default inntektskilde from membership when none provided", () => {
        const membership = [{ fomDato: "01.01.2023", tomDato: "31.12.2023" }];
        vi.mocked(Utils._isEmpty).mockReturnValue(false);

        const result = mapTilInntektskilderProps(undefined, membership);

        expect(result).toEqual([
          {
            fomDato: "01.01.2023",
            tomDato: "31.12.2023",
            kildetype: "",
            arbAvgBetales: "NEI",
            bruttoInntekt: "",
            erMaanedsbelop: "JA",
          },
        ]);
      });
    });
  });

  describe("beregnSumTilFakturaEllerRefusjon", () => {
    it("calculates correct sum with all values provided", () => {
      const result = beregnSumTilFakturaEllerRefusjon(10000, 3000, 2000, 1000);

      // 10000 - 3000 - 2000 + 1000 = 6000
      expect(result).toBe(6000);
    });

    it("handles undefined values correctly", () => {
      const result = beregnSumTilFakturaEllerRefusjon(5000, undefined, 1000, undefined);

      // 5000 - 0 - 1000 + 0 = 4000
      expect(result).toBe(4000);
    });

    it("returns 0 when all values are undefined", () => {
      const result = beregnSumTilFakturaEllerRefusjon(undefined, undefined, undefined, undefined);

      expect(result).toBe(0);
    });

    it("handles negative results correctly", () => {
      const result = beregnSumTilFakturaEllerRefusjon(1000, 5000, 2000, 500);

      // 1000 - 5000 - 2000 + 500 = -5500
      expect(result).toBe(-5500);
    });
  });
});
