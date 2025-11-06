import { describe, expect, it } from "vitest";
import vurdering_trygdeavgift, { arbAvgBetalesKreves, bruttoInntektKreves } from "./vurderingTrygdeavgiftSchema";
import MKV from "../../../../melosyskodeverk";
import { BOOLSK_STRING } from "../../../../constants";

const validate = async (values, context) => {
  try {
    await vurdering_trygdeavgift.validate(values, {
      abortEarly: false,
      context,
    });
    return null;
  } catch (e) {
    return e;
  }
};

const hasError = (e, path) => {
  if (!e) return false;
  const paths = Array.isArray(e.inner) ? e.inner.map((x) => x.path) : e.path ? [e.path] : [];
  return paths.includes(path);
};

describe("vurderingTrygdeavgiftSchema", () => {
  const baseValidData = {
    skatteforholdsperioder: [
      {
        fomDato: "01.01.2024",
        tomDato: "31.12.2024",
        skatteplikttype: "SKATTEPLIKTIG_I_NORGE",
      },
    ],
    inntektskilder: [],
  };

  const helseutgiftDekkesPeriode = {
    fom: "2024-01-01",
    tom: "2024-12-31",
  };

  describe("skatteforholdsperioder validering", () => {
    it("skal kreve minst én skatteforholdsperiode", async () => {
      const data = {
        skatteforholdsperioder: [],
        inntektskilder: [],
      };

      const err = await validate(data, { helseutgiftDekkesPeriode });
      expect(err).not.toBeNull();
    });

    it("skal kreve fomDato i skatteforholdsperiode", async () => {
      const data = {
        skatteforholdsperioder: [
          {
            fomDato: null,
            tomDato: "31.12.2024",
            skatteplikttype: "SKATTEPLIKTIG_I_NORGE",
          },
        ],
        inntektskilder: [],
      };

      const err = await validate(data, { helseutgiftDekkesPeriode });
      expect(hasError(err, "skatteforholdsperioder[0].fomDato")).toBe(true);
    });

    it("skal kreve tomDato i skatteforholdsperiode", async () => {
      const data = {
        skatteforholdsperioder: [
          {
            fomDato: "01.01.2024",
            tomDato: null,
            skatteplikttype: "SKATTEPLIKTIG_I_NORGE",
          },
        ],
        inntektskilder: [],
      };

      const err = await validate(data, { helseutgiftDekkesPeriode });
      expect(hasError(err, "skatteforholdsperioder[0].tomDato")).toBe(true);
    });

    it("skal kreve skatteplikttype i skatteforholdsperiode", async () => {
      const data = {
        skatteforholdsperioder: [
          {
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            skatteplikttype: null,
          },
        ],
        inntektskilder: [],
      };

      const err = await validate(data, { helseutgiftDekkesPeriode });
      expect(hasError(err, "skatteforholdsperioder[0].skatteplikttype")).toBe(true);
    });

    it("skal godta gyldig skatteforholdsperiode", async () => {
      const err = await validate(baseValidData, { helseutgiftDekkesPeriode });
      expect(err).toBeNull();
    });

    it("skal godta flere skatteforholdsperioder", async () => {
      const data = {
        skatteforholdsperioder: [
          {
            fomDato: "01.01.2024",
            tomDato: "30.06.2024",
            skatteplikttype: "SKATTEPLIKTIG_I_NORGE",
          },
          {
            fomDato: "01.07.2024",
            tomDato: "31.12.2024",
            skatteplikttype: "IKKE_SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [
          {
            kildetype: MKV.Koder.inntektskildetype.NÆRINGSINNTEKT_FRA_NORGE,
            arbAvgBetales: BOOLSK_STRING.SANN,
            bruttoInntekt: "100000",
            fomDato: "01.07.2024",
            tomDato: "31.12.2024",
          },
        ],
      };

      const err = await validate(data, { helseutgiftDekkesPeriode });
      expect(err).toBeNull();
    });
  });

  describe("inntektskilder conditional validering", () => {
    it("skal kreve inntektskilder når bruker ikke er skattepliktig i hele perioden", async () => {
      const data = {
        skatteforholdsperioder: [
          {
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            skatteplikttype: "IKKE_SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [],
      };

      const err = await validate(data, { helseutgiftDekkesPeriode });
      expect(err).not.toBeNull();
    });

    it("skal ikke kreve inntektskilder når bruker er skattepliktig i hele perioden", async () => {
      const data = {
        skatteforholdsperioder: [
          {
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            skatteplikttype: "SKATTEPLIKTIG_I_NORGE",
          },
        ],
        inntektskilder: [],
      };

      const err = await validate(data, { helseutgiftDekkesPeriode });
      expect(err).toBeNull();
    });
  });

  describe("inntektskilde feltvalidering", () => {
    const baseInntektskildeData = {
      skatteforholdsperioder: [
        {
          fomDato: "01.01.2024",
          tomDato: "31.12.2024",
          skatteplikttype: "IKKE_SKATTEPLIKTIG",
        },
      ],
      inntektskilder: [
        {
          kildetype: MKV.Koder.inntektskildetype.NÆRINGSINNTEKT_FRA_NORGE,
          arbAvgBetales: BOOLSK_STRING.SANN,
          bruttoInntekt: "100000",
          fomDato: "01.01.2024",
          tomDato: "31.12.2024",
        },
      ],
    };

    it("skal kreve kildetype i inntektskilde", async () => {
      const data = {
        ...baseInntektskildeData,
        inntektskilder: [
          {
            kildetype: null,
            bruttoInntekt: "100000",
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
          },
        ],
      };

      const err = await validate(data, { helseutgiftDekkesPeriode });
      expect(hasError(err, "inntektskilder[0].kildetype")).toBe(true);
    });

    it("skal kreve fomDato i inntektskilde", async () => {
      const data = {
        ...baseInntektskildeData,
        inntektskilder: [
          {
            kildetype: MKV.Koder.inntektskildetype.NÆRINGSINNTEKT_FRA_NORGE,
            bruttoInntekt: "100000",
            fomDato: null,
            tomDato: "31.12.2024",
          },
        ],
      };

      const err = await validate(data, { helseutgiftDekkesPeriode });
      expect(hasError(err, "inntektskilder[0].fomDato")).toBe(true);
    });

    it("skal kreve tomDato i inntektskilde", async () => {
      const data = {
        ...baseInntektskildeData,
        inntektskilder: [
          {
            kildetype: MKV.Koder.inntektskildetype.NÆRINGSINNTEKT_FRA_NORGE,
            bruttoInntekt: "100000",
            fomDato: "01.01.2024",
            tomDato: null,
          },
        ],
      };

      const err = await validate(data, { helseutgiftDekkesPeriode });
      expect(hasError(err, "inntektskilder[0].tomDato")).toBe(true);
    });

    it("skal godta gyldig inntektskilde", async () => {
      const err = await validate(baseInntektskildeData, { helseutgiftDekkesPeriode });
      expect(err).toBeNull();
    });
  });

  describe("arbAvgBetalesKreves helper function", () => {
    it("skal returnere true for NÆRINGSINNTEKT_FRA_NORGE", () => {
      expect(arbAvgBetalesKreves(MKV.Koder.inntektskildetype.NÆRINGSINNTEKT_FRA_NORGE)).toBe(true);
    });

    it("skal returnere true for INNTEKT_FRA_UTLANDET", () => {
      expect(arbAvgBetalesKreves(MKV.Koder.inntektskildetype.INNTEKT_FRA_UTLANDET)).toBe(true);
    });

    it("skal returnere false for MISJONÆR", () => {
      expect(arbAvgBetalesKreves(MKV.Koder.inntektskildetype.MISJONÆR)).toBe(false);
    });

    it("skal returnere true for FN_SKATTEFRITAK", () => {
      expect(arbAvgBetalesKreves(MKV.Koder.inntektskildetype.FN_SKATTEFRITAK)).toBe(true);
    });

    it("skal returnere true for PENSJON_UFØRETRYGD", () => {
      expect(arbAvgBetalesKreves(MKV.Koder.inntektskildetype.PENSJON_UFØRETRYGD)).toBe(true);
    });
  });

  describe("bruttoInntektKreves helper function", () => {
    it("skal returnere true når bruker ikke er skattepliktig i hele perioden", () => {
      expect(bruttoInntektKreves(false, MKV.Koder.inntektskildetype.INNTEKT_FRA_UTLANDET, BOOLSK_STRING.SANN)).toBe(
        true,
      );
    });

    it("skal returnere true for NÆRINGSINNTEKT_FRA_NORGE selv om skattepliktig", () => {
      expect(bruttoInntektKreves(true, MKV.Koder.inntektskildetype.NÆRINGSINNTEKT_FRA_NORGE, BOOLSK_STRING.SANN)).toBe(
        true,
      );
    });

    it("skal returnere true for FN_SKATTEFRITAK selv om skattepliktig", () => {
      expect(bruttoInntektKreves(true, MKV.Koder.inntektskildetype.FN_SKATTEFRITAK, BOOLSK_STRING.SANN)).toBe(true);
    });

    it("skal returnere true for PENSJON_UFØRETRYGD selv om skattepliktig", () => {
      expect(bruttoInntektKreves(true, MKV.Koder.inntektskildetype.PENSJON_UFØRETRYGD, BOOLSK_STRING.SANN)).toBe(true);
    });

    it("skal returnere true for INNTEKT_FRA_UTLANDET når arbAvgBetales er USANN", () => {
      expect(bruttoInntektKreves(true, MKV.Koder.inntektskildetype.INNTEKT_FRA_UTLANDET, BOOLSK_STRING.USANN)).toBe(
        true,
      );
    });

    it("skal returnere false for INNTEKT_FRA_UTLANDET når arbAvgBetales er SANN og bruker er skattepliktig", () => {
      expect(bruttoInntektKreves(true, MKV.Koder.inntektskildetype.INNTEKT_FRA_UTLANDET, BOOLSK_STRING.SANN)).toBe(
        false,
      );
    });

    it("skal returnere true for PENSJON_UFØRETRYGD_KILDESKATT når arbAvgBetales er USANN", () => {
      expect(
        bruttoInntektKreves(true, MKV.Koder.inntektskildetype.PENSJON_UFØRETRYGD_KILDESKATT, BOOLSK_STRING.USANN),
      ).toBe(true);
    });
  });

  describe("komplekse scenario", () => {
    it("skal validere komplett gyldig scenario med skattepliktig i hele perioden", async () => {
      const data = {
        skatteforholdsperioder: [
          {
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            skatteplikttype: "SKATTEPLIKTIG_I_NORGE",
          },
        ],
        inntektskilder: [],
      };

      const err = await validate(data, { helseutgiftDekkesPeriode });
      expect(err).toBeNull();
    });

    it("skal validere scenario med både skattepliktig og ikke-skattepliktig periode", async () => {
      const data = {
        skatteforholdsperioder: [
          {
            fomDato: "01.01.2024",
            tomDato: "30.06.2024",
            skatteplikttype: "SKATTEPLIKTIG_I_NORGE",
          },
          {
            fomDato: "01.07.2024",
            tomDato: "31.12.2024",
            skatteplikttype: "IKKE_SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [
          {
            kildetype: MKV.Koder.inntektskildetype.NÆRINGSINNTEKT_FRA_NORGE,
            arbAvgBetales: BOOLSK_STRING.SANN,
            bruttoInntekt: "500000",
            fomDato: "01.07.2024",
            tomDato: "31.12.2024",
          },
        ],
      };

      const err = await validate(data, { helseutgiftDekkesPeriode });
      expect(err).toBeNull();
    });

    it("skal validere scenario med flere inntektskilder", async () => {
      const data = {
        skatteforholdsperioder: [
          {
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            skatteplikttype: "IKKE_SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [
          {
            kildetype: MKV.Koder.inntektskildetype.NÆRINGSINNTEKT_FRA_NORGE,
            arbAvgBetales: BOOLSK_STRING.SANN,
            bruttoInntekt: "300000",
            fomDato: "01.01.2024",
            tomDato: "30.06.2024",
          },
          {
            kildetype: MKV.Koder.inntektskildetype.INNTEKT_FRA_UTLANDET,
            arbAvgBetales: BOOLSK_STRING.USANN,
            bruttoInntekt: "200000",
            fomDato: "01.07.2024",
            tomDato: "31.12.2024",
          },
        ],
      };

      const err = await validate(data, { helseutgiftDekkesPeriode });
      expect(err).toBeNull();
    });
  });
});
