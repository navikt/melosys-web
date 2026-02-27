import { beforeEach, describe, expect, it, vi } from "vitest";
import * as Api from "../../../../services/api";
import * as Utils from "../../../../utils";
import {
  beregnSumTilFakturaEllerRefusjon,
  beregnTrygdeavgiftsperioder,
  erBrukerSkattepliktigIHelePerioden,
  erGyldigeMedlemskapsperiodeDatoerForAutoUtfylling,
  hentMedlemskapsFomTomDato,
  mapFeilmelding,
  mapTilInntektskilderProps,
  mapTilSkatteforholdProps,
} from "./utils";
import { MedlemskapsperiodeForAvgift } from "../../../../services/modules/types/periodeTyper";

// Helper function to create mock Medlemskapsperiode
const createMockMedlemskapsperiode = (
  overrides?: Partial<MedlemskapsperiodeForAvgift>,
): MedlemskapsperiodeForAvgift => ({
  type: "MEDLEMSKAPSPERIODE",
  id: 1,
  fomDato: "01.01.2023",
  tomDato: "31.12.2023",
  bestemmelse: "FTRL_2_7",
  innvilgelsesResultat: "INNVILGET",
  trygdedekning: "FULL_DEKNING",
  medlemskapstype: "PLIKTIG",
  ...overrides,
});

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        const periods = [createMockMedlemskapsperiode()];
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
        const membership = [createMockMedlemskapsperiode()];
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
            avgiftspliktigInntekt: 500000,
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
            bruttoInntekt: 500000,
            erMaanedsbelop: "NEI",
          },
        ]);
      });

      it("creates default inntektskilde from membership when none provided", () => {
        const membership = [createMockMedlemskapsperiode()];
        vi.mocked(Utils._isEmpty).mockReturnValue(false);

        const result = mapTilInntektskilderProps(undefined, membership);

        expect(result).toEqual([
          {
            fomDato: "01.01.2023",
            tomDato: "31.12.2023",
            kildetype: "",
            arbAvgBetales: "NEI",
            bruttoInntekt: undefined,
            erMaanedsbelop: "JA",
          },
        ]);
      });

      // MELOSYS-7639: Test for forhåndsutfylt inntektskilde når backend ikke har data
      it("skal sette default erMaanedsbelop når ingen inntektskilder finnes fra backend", () => {
        const membership = [createMockMedlemskapsperiode()];
        vi.mocked(Utils._isEmpty).mockReturnValue(false);

        const result = mapTilInntektskilderProps(undefined, membership);

        // Forhåndsutfylt objekt MÅ ha erMaanedsbelop satt til default-verdi
        // Dette sikrer at verdien ikke blir undefined ved beregning
        // Default skal være "JA" (Md.) - konsistent med "Legg til inntekt"-knappen
        expect(result[0].erMaanedsbelop).toBe("JA");
      });

      it("mapper erMaanedsbelop korrekt fra backend når inntektskilder finnes", () => {
        const income = [
          {
            fomDato: "2023-01-01",
            tomDato: "2023-12-31",
            type: "ARBEID",
            arbeidsgiversavgiftBetales: false,
            avgiftspliktigInntekt: 600000,
            erMaanedsbelop: false, // Backend sender boolean
          },
        ];
        vi.mocked(Utils._isEmpty).mockReturnValue(false);

        const result = mapTilInntektskilderProps(income, []);

        // Frontend skal få string "NEI"
        expect(result[0].erMaanedsbelop).toBe("NEI");
      });

      // MELOSYS-7639: Test for å verifisere at verdier holder seg sammen ved forskjellig rekkefølge
      it("skal bevare korrekt mapping mellom datoer og periodetype selv om backend returnerer data i forskjellig rekkefølge", () => {
        // Scenario: Backend returnerer tre inntektskilder med FORSKJELLIGE verdier i ALLE kolonner
        // Dette gjør det lett å spotte om verdier "hopper" mellom rader
        const inntektskilderFraBackend = [
          {
            fomDato: "2023-03-01", // Mars (siste periode)
            tomDato: "2023-03-31",
            type: "ARBEIDSINNTEKT",
            arbeidsgiversavgiftBetales: true,
            avgiftspliktigInntekt: 30000,
            erMaanedsbelop: false, // Total
          },
          {
            fomDato: "2023-01-01", // Januar (første periode)
            tomDato: "2023-01-31",
            type: "NÆRINGSINNTEKT",
            arbeidsgiversavgiftBetales: false,
            avgiftspliktigInntekt: 10000,
            erMaanedsbelop: true, // Md.
          },
          {
            fomDato: "2023-02-01", // Februar (midtre periode)
            tomDato: "2023-02-28",
            type: "PENSJON",
            arbeidsgiversavgiftBetales: false,
            avgiftspliktigInntekt: 20000,
            erMaanedsbelop: true, // Md.
          },
        ];

        vi.mocked(Utils._isEmpty).mockReturnValue(false);
        // Mock datoformatering til å returnere input uendret for enklere assertions
        vi.mocked(Utils.dato.formatterDatoTilNorsk).mockImplementation((dato) => (dato as string) ?? "");

        const result = mapTilInntektskilderProps(inntektskilderFraBackend, []);

        // UTEN sortering: Data kommer i samme rekkefølge som backend sendte (Mars, Januar, Februar)
        // Index 0 = Mars (siste periode) med Total
        expect(result[0].fomDato).toBe("2023-03-01");
        expect(result[0].tomDato).toBe("2023-03-31");
        expect(result[0].kildetype).toBe("ARBEIDSINNTEKT");
        expect(result[0].bruttoInntekt).toBe(30000);
        expect(result[0].erMaanedsbelop).toBe("NEI"); // Total skal følge Mars
        expect(result[0].arbAvgBetales).toBe("JA");

        // Index 1 = Januar (første periode) med Md.
        expect(result[1].fomDato).toBe("2023-01-01");
        expect(result[1].tomDato).toBe("2023-01-31");
        expect(result[1].kildetype).toBe("NÆRINGSINNTEKT");
        expect(result[1].bruttoInntekt).toBe(10000);
        expect(result[1].erMaanedsbelop).toBe("JA"); // Md. skal følge Januar
        expect(result[1].arbAvgBetales).toBe("NEI");

        // Index 2 = Februar (midtre periode) med Md.
        expect(result[2].fomDato).toBe("2023-02-01");
        expect(result[2].tomDato).toBe("2023-02-28");
        expect(result[2].kildetype).toBe("PENSJON");
        expect(result[2].bruttoInntekt).toBe(20000);
        expect(result[2].erMaanedsbelop).toBe("JA"); // Md. skal følge Februar
        expect(result[2].arbAvgBetales).toBe("NEI");
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

  describe("erGyldigeMedlemskapsperiodeDatoerForAutoUtfylling", () => {
    it("returnerer false når fomDato er tom", () => {
      const result = erGyldigeMedlemskapsperiodeDatoerForAutoUtfylling("", "31.12.2020", 2020);
      expect(result).toBe(false);
    });

    it("returnerer false når tomDato er tom", () => {
      const result = erGyldigeMedlemskapsperiodeDatoerForAutoUtfylling("01.01.2020", "", 2020);
      expect(result).toBe(false);
    });

    it("returnerer false når input er ugyldig som 'dd11ss'", () => {
      const result = erGyldigeMedlemskapsperiodeDatoerForAutoUtfylling("dd11ss", "31.12.2020", 2020);
      expect(result).toBe(false);
    });

    it("returnerer false når tomDato er ugyldig", () => {
      const result = erGyldigeMedlemskapsperiodeDatoerForAutoUtfylling("01.01.2020", "abc123", 2020);
      expect(result).toBe(false);
    });

    it("returnerer false når fomDato er før valgt år", () => {
      const result = erGyldigeMedlemskapsperiodeDatoerForAutoUtfylling("31.12.2019", "31.12.2020", 2020);
      expect(result).toBe(false);
    });

    it("returnerer false når tomDato er etter valgt år", () => {
      const result = erGyldigeMedlemskapsperiodeDatoerForAutoUtfylling("01.01.2020", "01.01.2021", 2020);
      expect(result).toBe(false);
    });

    it("returnerer true når datoer er gyldige og innenfor valgt år", () => {
      const result = erGyldigeMedlemskapsperiodeDatoerForAutoUtfylling("01.01.2020", "31.12.2020", 2020);
      expect(result).toBe(true);
    });

    it("returnerer true når datoer er gyldige og valgtAar ikke er spesifisert", () => {
      const result = erGyldigeMedlemskapsperiodeDatoerForAutoUtfylling("01.01.2020", "31.12.2020");
      expect(result).toBe(true);
    });
  });
});
