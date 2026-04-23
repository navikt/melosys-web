import { describe, expect, it } from "vitest";
import aarsavregningUtenEllerDeltGrunnlagSchema from "./aarsavregningUtenEllerDeltGrunnlagSchema";
import MKV from "../../../../../melosyskodeverk";

const { OPPLYSNINGER_ENDRET } = MKV.Koder.endeligAvgiftValg;
const { PLIKTIG } = MKV.Koder.medlemskapstyper;

const validate = async (values: Record<string, unknown>, context: Record<string, unknown> = {}) => {
  try {
    await aarsavregningUtenEllerDeltGrunnlagSchema.validate(values, {
      abortEarly: false,
      context: { aar: 2024, ...context },
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

    // Håndter både string og object med melding
    const errorMessage = typeof e.message === "string" ? e.message : e.message?.melding;
    return matchesPath && errorMessage === message;
  });
};

describe("aarsavregningUtenEllerDeltGrunnlagSchema - Datovalidering (MELOSYS-7612)", () => {
  describe("Medlemskapsperioder - fomDato validering", () => {
    it("skal vise 'Skriv inn en gyldig dato' for ugyldig input som 'dd11ss'", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        bestemmelse: "FTRL_2_7",
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "dd11ss",
            tomDato: "31.12.2024",
            trygdedekning: "FULL_DEKNING",
            medlemskapstype: PLIKTIG,
          },
        ],
        skatteforholdsperioder: [],
        inntektskilder: [],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeTruthy();
      expect(hasError(err, "avgiftspliktigperioder[0].fomDato", "Skriv inn en gyldig dato")).toBe(true);
      expect(hasError(err, "avgiftspliktigperioder[0].fomDato", "Utenfor valgt år")).toBe(false);
    });

    it("skal vise 'Skriv inn en gyldig dato' for ugyldig input som '99.99.9999'", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        bestemmelse: "FTRL_2_7",
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "99.99.9999",
            tomDato: "31.12.2024",
            trygdedekning: "FULL_DEKNING",
            medlemskapstype: PLIKTIG,
          },
        ],
        skatteforholdsperioder: [],
        inntektskilder: [],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeTruthy();
      expect(hasError(err, "avgiftspliktigperioder[0].fomDato", "Skriv inn en gyldig dato")).toBe(true);
      expect(hasError(err, "avgiftspliktigperioder[0].fomDato", "Utenfor valgt år")).toBe(false);
    });

    it("skal vise 'Utenfor valgt år' for gyldig dato utenfor året", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        bestemmelse: "FTRL_2_7",
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "01.01.2023",
            tomDato: "31.12.2024",
            trygdedekning: "FULL_DEKNING",
            medlemskapstype: PLIKTIG,
          },
        ],
        skatteforholdsperioder: [],
        inntektskilder: [],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeTruthy();
      expect(hasError(err, "avgiftspliktigperioder[0].fomDato", "Utenfor valgt år")).toBe(true);
      expect(hasError(err, "avgiftspliktigperioder[0].fomDato", "Skriv inn en gyldig dato")).toBe(false);
    });

    it("skal godta gyldig dato innenfor året", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        bestemmelse: "FTRL_2_7",
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            trygdedekning: "FULL_DEKNING",
            medlemskapstype: PLIKTIG,
          },
        ],
        skatteforholdsperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            skatteplikttype: "SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeNull();
    });
  });

  describe("Medlemskapsperioder - tomDato validering", () => {
    it("skal vise 'Skriv inn en gyldig dato' for ugyldig input", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        bestemmelse: "FTRL_2_7",
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "abc123def",
            trygdedekning: "FULL_DEKNING",
            medlemskapstype: PLIKTIG,
          },
        ],
        skatteforholdsperioder: [],
        inntektskilder: [],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeTruthy();
      expect(hasError(err, "avgiftspliktigperioder[0].tomDato", "Skriv inn en gyldig dato")).toBe(true);
      expect(hasError(err, "avgiftspliktigperioder[0].tomDato", "Utenfor valgt år")).toBe(false);
    });

    it("skal vise 'Utenfor valgt år' for gyldig dato utenfor året", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        bestemmelse: "FTRL_2_7",
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "31.12.2025",
            trygdedekning: "FULL_DEKNING",
            medlemskapstype: PLIKTIG,
          },
        ],
        skatteforholdsperioder: [],
        inntektskilder: [],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeTruthy();
      expect(hasError(err, "avgiftspliktigperioder[0].tomDato", "Utenfor valgt år")).toBe(true);
    });
  });

  describe("Skatteforholdsperioder - datovalidering", () => {
    it("skal vise 'Skriv inn en gyldig dato' for ugyldig fomDato", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        bestemmelse: "FTRL_2_7",
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            trygdedekning: "FULL_DEKNING",
            medlemskapstype: PLIKTIG,
          },
        ],
        skatteforholdsperioder: [
          {
            id: 1,
            fomDato: "xx.yy.zzzz",
            tomDato: "31.12.2024",
            skatteplikttype: "SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeTruthy();
      expect(hasError(err, "skatteforholdsperioder[0].fomDato", "Skriv inn en gyldig dato")).toBe(true);
      expect(hasError(err, "skatteforholdsperioder[0].fomDato", "Utenfor valgt år")).toBe(false);
    });

    it("skal vise 'Utenfor medlemskapsperiode' for gyldig dato utenfor medlemskapsperioden", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        bestemmelse: "FTRL_2_7",
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            trygdedekning: "FULL_DEKNING",
            medlemskapstype: PLIKTIG,
          },
        ],
        skatteforholdsperioder: [
          {
            id: 1,
            fomDato: "01.01.2020",
            tomDato: "31.12.2024",
            skatteplikttype: "SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeTruthy();
      expect(hasError(err, "skatteforholdsperioder[0].fomDato", "Utenfor medlemskapsperiode")).toBe(true);
    });
  });

  describe("Inntektskilder - datovalidering", () => {
    it("skal vise 'Skriv inn en gyldig dato' for ugyldig fomDato", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        bestemmelse: "FTRL_2_7",
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            trygdedekning: "FULL_DEKNING",
            medlemskapstype: "FRIVILLIG",
          },
        ],
        skatteforholdsperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            skatteplikttype: "SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [
          {
            id: 1,
            kildetype: "NÆRINGSINNTEKT_FRA_NORGE",
            fomDato: "12.34.5678",
            tomDato: "31.12.2024",
            bruttoInntekt: "500000",
          },
        ],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeTruthy();
      expect(hasError(err, "inntektskilder[0].fomDato", "Skriv inn en gyldig dato")).toBe(true);
    });

    it("skal godta gyldig dato for inntektskilde", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        bestemmelse: "FTRL_2_7",
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            trygdedekning: "FULL_DEKNING",
            medlemskapstype: "FRIVILLIG",
          },
        ],
        skatteforholdsperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            skatteplikttype: "SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [
          {
            id: 1,
            kildetype: "NÆRINGSINNTEKT_FRA_NORGE",
            fomDato: "01.06.2024",
            tomDato: "31.12.2024",
            bruttoInntekt: "500000",
            arbAvgBetales: "USANN", // Kreves for FRIVILLIG medlemskapstype
          },
        ],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeNull();
    });
  });

  describe("Edge cases", () => {
    it("skal håndtere tom streng som gyldig (returnerer false fra erInnenforValgtAarTest)", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        bestemmelse: "FTRL_2_7",
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "",
            tomDato: "31.12.2024",
            trygdedekning: "FULL_DEKNING",
            medlemskapstype: PLIKTIG,
          },
        ],
        skatteforholdsperioder: [],
        inntektskilder: [],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeTruthy();
      // Skal feile på required, ikke på erInnenforValgtAarTest
      expect(hasError(err, "avgiftspliktigperioder[0].fomDato", "Må fylles ut")).toBe(true);
    });

    it("skal håndtere delvis utfylt dato", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        bestemmelse: "FTRL_2_7",
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "01.01",
            tomDato: "31.12.2024",
            trygdedekning: "FULL_DEKNING",
            medlemskapstype: PLIKTIG,
          },
        ],
        skatteforholdsperioder: [],
        inntektskilder: [],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeTruthy();
      expect(hasError(err, "avgiftspliktigperioder[0].fomDato", "Skriv inn en gyldig dato")).toBe(true);
    });
  });
});

describe("aarsavregningUtenEllerDeltGrunnlagSchema - bostedLandkode validering", () => {
  it("skal kreve bostedLandkode for HELSEUTGIFTDEKKESPERIODE", async () => {
    const values = {
      endeligAvgiftValg: OPPLYSNINGER_ENDRET,
      avgiftspliktigperioder: [
        {
          id: -2,
          fomDato: "01.01.2024",
          tomDato: "31.12.2024",
          type: "HELSEUTGIFTDEKKESPERIODE",
          bostedLandkode: "",
        },
      ],
      skatteforholdsperioder: [
        { id: 1, fomDato: "01.01.2024", tomDato: "31.12.2024", skatteplikttype: "SKATTEPLIKTIG" },
      ],
      inntektskilder: [],
    };

    const err = await validate(values, { aar: 2024 });
    expect(err).toBeTruthy();
    expect(hasError(err, "avgiftspliktigperioder[0].bostedLandkode", "Må fylles ut")).toBe(true);
  });

  it("skal kreve bostedLandkode for alle HELSEUTGIFTDEKKESPERIODE-perioder", async () => {
    const values = {
      endeligAvgiftValg: OPPLYSNINGER_ENDRET,
      avgiftspliktigperioder: [
        {
          id: 1,
          fomDato: "01.01.2024",
          tomDato: "30.06.2024",
          type: "HELSEUTGIFTDEKKESPERIODE",
          bostedLandkode: "SE",
        },
        {
          id: -2,
          fomDato: "01.07.2024",
          tomDato: "31.12.2024",
          type: "HELSEUTGIFTDEKKESPERIODE",
          bostedLandkode: "",
        },
      ],
      skatteforholdsperioder: [
        { id: 1, fomDato: "01.01.2024", tomDato: "31.12.2024", skatteplikttype: "SKATTEPLIKTIG" },
      ],
      inntektskilder: [],
    };

    const err = await validate(values, { aar: 2024 });
    expect(err).toBeTruthy();
    expect(hasError(err, "avgiftspliktigperioder[1].bostedLandkode", "Må fylles ut")).toBe(true);
  });

  it("skal godta utfylt bostedLandkode for HELSEUTGIFTDEKKESPERIODE", async () => {
    const values = {
      endeligAvgiftValg: OPPLYSNINGER_ENDRET,
      avgiftspliktigperioder: [
        {
          id: 1,
          fomDato: "01.01.2024",
          tomDato: "31.12.2024",
          type: "HELSEUTGIFTDEKKESPERIODE",
          bostedLandkode: "SE",
        },
      ],
      skatteforholdsperioder: [
        { id: 1, fomDato: "01.01.2024", tomDato: "31.12.2024", skatteplikttype: "SKATTEPLIKTIG" },
      ],
      inntektskilder: [],
    };

    const err = await validate(values, { aar: 2024 });
    expect(err).toBeNull();
  });

  it("skal ikke kreve bostedLandkode for MEDLEMSKAPSPERIODE", async () => {
    const values = {
      endeligAvgiftValg: OPPLYSNINGER_ENDRET,
      bestemmelse: "FTRL_2_7",
      avgiftspliktigperioder: [
        {
          id: 1,
          fomDato: "01.01.2024",
          tomDato: "31.12.2024",
          trygdedekning: "FULL_DEKNING",
          medlemskapstype: PLIKTIG,
          type: "MEDLEMSKAPSPERIODE",
        },
      ],
      skatteforholdsperioder: [
        { id: 1, fomDato: "01.01.2024", tomDato: "31.12.2024", skatteplikttype: "SKATTEPLIKTIG" },
      ],
      inntektskilder: [],
    };

    const err = await validate(values, { aar: 2024 });
    expect(err).toBeNull();
  });
});

describe("aarsavregningUtenEllerDeltGrunnlagSchema - erInnenforAvgiftspliktigperiodeTest dynamiske feilmeldinger", () => {
  describe("Skatteforholdsperioder", () => {
    it("skal vise 'Utenfor medlemskapsperiode' når skatteforhold er utenfor medlemskapsperiode", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        bestemmelse: "FTRL_2_7",
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "30.06.2024",
            trygdedekning: "FULL_DEKNING",
            medlemskapstype: PLIKTIG,
            type: "MEDLEMSKAPSPERIODE",
          },
        ],
        skatteforholdsperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            skatteplikttype: "SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeTruthy();
      expect(hasError(err, "skatteforholdsperioder[0].tomDato", "Utenfor medlemskapsperiode")).toBe(true);
    });

    it("skal vise 'Utenfor periode Norge dekker helseutgifter' når skatteforhold er utenfor helseutgiftdekkesperiode", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "30.06.2024",
            trygdedekning: "",
            medlemskapstype: PLIKTIG,
            type: "HELSEUTGIFTDEKKESPERIODE",
          },
        ],
        skatteforholdsperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            skatteplikttype: "SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeTruthy();
      expect(hasError(err, "skatteforholdsperioder[0].tomDato", "Utenfor periode Norge dekker helseutgifter")).toBe(
        true,
      );
    });
  });

  describe("Inntektskilder", () => {
    it("skal vise 'Utenfor medlemskapsperiode' når inntektskilde er utenfor medlemskapsperiode", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        bestemmelse: "FTRL_2_7",
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "30.06.2024",
            trygdedekning: "FULL_DEKNING",
            medlemskapstype: "FRIVILLIG",
            type: "MEDLEMSKAPSPERIODE",
          },
        ],
        skatteforholdsperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "30.06.2024",
            skatteplikttype: "SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [
          {
            id: 1,
            kildetype: "NÆRINGSINNTEKT_FRA_NORGE",
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            bruttoInntekt: "500000",
          },
        ],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeTruthy();
      expect(hasError(err, "inntektskilder[0].tomDato", "Utenfor medlemskapsperiode")).toBe(true);
    });

    it("skal vise 'Utenfor periode Norge dekker helseutgifter' når inntektskilde er utenfor helseutgiftdekkesperiode", async () => {
      const values = {
        endeligAvgiftValg: OPPLYSNINGER_ENDRET,
        avgiftspliktigperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "30.06.2024",
            trygdedekning: "",
            medlemskapstype: PLIKTIG,
            type: "HELSEUTGIFTDEKKESPERIODE",
          },
        ],
        skatteforholdsperioder: [
          {
            id: 1,
            fomDato: "01.01.2024",
            tomDato: "30.06.2024",
            skatteplikttype: "IKKE_SKATTEPLIKTIG",
          },
        ],
        inntektskilder: [
          {
            id: 1,
            kildetype: "NÆRINGSINNTEKT_FRA_NORGE",
            fomDato: "01.01.2024",
            tomDato: "31.12.2024",
            bruttoInntekt: "500000",
          },
        ],
      };

      const err = await validate(values, { aar: 2024 });
      expect(err).toBeTruthy();
      expect(hasError(err, "inntektskilder[0].tomDato", "Utenfor periode Norge dekker helseutgifter")).toBe(true);
    });
  });
});
