import { describe, expect, it } from "vitest";
import aarsavregningMedGrunnlagSchema from "./aarsavregningMedGrunnlagSchema";
import MKV from "../../../../../melosyskodeverk";

const { OPPLYSNINGER_ENDRET } = MKV.Koder.endeligAvgiftValg;

const validate = async (values: Record<string, unknown>, context: Record<string, unknown> = {}) => {
  try {
    await aarsavregningMedGrunnlagSchema.validate(values, {
      abortEarly: false,
      context,
    });
    return null;
  } catch (e: any) {
    return e;
  }
};

const hasError = (
  err: {
    inner?: { path?: string; message?: string | { melding?: string } }[];
    path?: string;
    message?: string | { melding?: string };
  } | null,
  path: string,
  message?: string,
) => {
  if (!err) return false;
  const errors = Array.isArray(err.inner) ? err.inner : [err];
  return errors.some((e) => {
    const matchesPath = e.path === path;
    if (!message) return matchesPath;

    const errorMessage = typeof e.message === "string" ? e.message : e.message?.melding;
    return matchesPath && errorMessage === message;
  });
};

describe("aarsavregningMedGrunnlagSchema - erInnenforAvgiftspliktigperiodeTest dynamiske feilmeldinger", () => {
  const baseContext = {
    avgiftspliktigperiode: { fomDato: "01.01.2024", tomDato: "30.06.2024" },
    medlemskapsTypeErPliktig: true,
    erHelseutgiftDekkesPeriode: false,
  };

  describe("Skatteforholdsperioder", () => {
    it("skal vise 'Utenfor medl.periode' når skatteforhold er utenfor medlemskapsperiode", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        skatteforholdsperioder: [
          {
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            skatteplikttype: "SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [],
      };

      const err = await validate(values, { ...baseContext, erHelseutgiftDekkesPeriode: false });
      expect(err).toBeTruthy();
      expect(hasError(err, "skatteforholdsperioder[0].tomDato", "Utenfor medl.periode")).toBe(true);
    });

    it("skal vise 'Utenfor periode Norge dekker helseutgifter' når skatteforhold er utenfor helseutgiftdekkesperiode", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        skatteforholdsperioder: [
          {
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            skatteplikttype: "SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [],
      };

      const err = await validate(values, { ...baseContext, erHelseutgiftDekkesPeriode: true });
      expect(err).toBeTruthy();
      expect(hasError(err, "skatteforholdsperioder[0].tomDato", "Utenfor periode Norge dekker helseutgifter")).toBe(
        true,
      );
    });
  });

  describe("Inntektskilder", () => {
    it("skal vise 'Utenfor medl.periode' når inntektskilde er utenfor medlemskapsperiode", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        skatteforholdsperioder: [
          {
            fomDato: "01.01.2024",
            tomDato: "30.06.2024",
            skatteplikttype: "IKKE_SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [
          {
            kildetype: "NÆRINGSINNTEKT_FRA_NORGE",
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            bruttoInntekt: "500000",
          },
        ],
      };

      const err = await validate(values, {
        ...baseContext,
        medlemskapsTypeErPliktig: false,
        erHelseutgiftDekkesPeriode: false,
      });
      expect(err).toBeTruthy();
      expect(hasError(err, "inntektskilder[0].tomDato", "Utenfor medl.periode")).toBe(true);
    });

    it("skal vise 'Utenfor periode Norge dekker helseutgifter' når inntektskilde er utenfor helseutgiftdekkesperiode", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        skatteforholdsperioder: [
          {
            fomDato: "01.01.2024",
            tomDato: "30.06.2024",
            skatteplikttype: "IKKE_SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [
          {
            kildetype: "NÆRINGSINNTEKT_FRA_NORGE",
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            bruttoInntekt: "500000",
          },
        ],
      };

      const err = await validate(values, {
        ...baseContext,
        medlemskapsTypeErPliktig: false,
        erHelseutgiftDekkesPeriode: true,
      });
      expect(err).toBeTruthy();
      expect(hasError(err, "inntektskilder[0].tomDato", "Utenfor periode Norge dekker helseutgifter")).toBe(true);
    });
  });
});
