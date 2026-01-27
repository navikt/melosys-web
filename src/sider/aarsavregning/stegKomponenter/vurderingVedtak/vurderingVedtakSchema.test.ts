import { describe, expect, it } from "vitest";
import vurderingVedtakSchema, { DU_MAA_OPPGI_BEGRUNNELSE } from "./vurderingVedtakSchema";
import MKV from "../../../../melosyskodeverk";

const { MANUELL_ENDELIG_AVGIFT, BEREGNET_AVGIFT } = MKV.Koder.endeligAvgiftValg;

interface ValidationContext {
  endeligAvgiftValg?: string;
  erNyVurdering?: boolean;
}

const validate = async (values: Record<string, unknown>, context: ValidationContext = {}) => {
  try {
    await vurderingVedtakSchema.validate(values, { abortEarly: false, context });
    return null;
  } catch (e) {
    return e;
  }
};

const hasError = (error: unknown, field: string, expectedMessage: string): boolean => {
  if (!error || typeof error !== "object" || !("inner" in error)) return false;
  const yupError = error as { inner: Array<{ path: string; message: unknown }> };
  return yupError.inner.some((e) => {
    if (e.path !== field) return false;
    // Handle both string messages and object messages like { melding: "..." }
    if (typeof e.message === "string") return e.message === expectedMessage;
    if (typeof e.message === "object" && e.message !== null && "melding" in e.message) {
      return (e.message as { melding: string }).melding === expectedMessage;
    }
    return false;
  });
};

describe("vurderingVedtakSchema", () => {
  describe("AK1: Førstegangsbehandling uten manuell avgift", () => {
    it("skal IKKE kreve begrunnelse når endeligAvgiftValg er BEREGNET_AVGIFT og erNyVurdering er false", async () => {
      const error = await validate(
        { begrunnelseFritekst: "" },
        {
          endeligAvgiftValg: BEREGNET_AVGIFT,
          erNyVurdering: false,
        },
      );
      expect(error).toBeNull();
    });

    it("skal godta tom begrunnelse ved førstegangsbehandling", async () => {
      const error = await validate(
        { begrunnelseFritekst: undefined },
        {
          endeligAvgiftValg: BEREGNET_AVGIFT,
          erNyVurdering: false,
        },
      );
      expect(error).toBeNull();
    });
  });

  describe("AK2: Førstegangsbehandling med manuell avgift", () => {
    it("skal kreve begrunnelse når endeligAvgiftValg er MANUELL_ENDELIG_AVGIFT", async () => {
      const error = await validate(
        { begrunnelseFritekst: "" },
        {
          endeligAvgiftValg: MANUELL_ENDELIG_AVGIFT,
          erNyVurdering: false,
        },
      );
      expect(hasError(error, "begrunnelseFritekst", DU_MAA_OPPGI_BEGRUNNELSE.melding)).toBe(true);
    });

    it("skal godta utfylt begrunnelse ved manuell avgift", async () => {
      const error = await validate(
        { begrunnelseFritekst: "Begrunnelse for manuell avgift" },
        {
          endeligAvgiftValg: MANUELL_ENDELIG_AVGIFT,
          erNyVurdering: false,
        },
      );
      expect(error).toBeNull();
    });
  });

  describe("AK3: Ny vurdering uten manuell avgift", () => {
    it("skal kreve begrunnelse når erNyVurdering er true", async () => {
      const error = await validate(
        { begrunnelseFritekst: "" },
        {
          endeligAvgiftValg: BEREGNET_AVGIFT,
          erNyVurdering: true,
        },
      );
      expect(hasError(error, "begrunnelseFritekst", DU_MAA_OPPGI_BEGRUNNELSE.melding)).toBe(true);
    });

    it("skal godta utfylt begrunnelse ved ny vurdering", async () => {
      const error = await validate(
        { begrunnelseFritekst: "Begrunnelse for § 12-1" },
        {
          endeligAvgiftValg: BEREGNET_AVGIFT,
          erNyVurdering: true,
        },
      );
      expect(error).toBeNull();
    });
  });

  describe("AK4: Ny vurdering med manuell avgift", () => {
    it("skal kreve begrunnelse når både manuell avgift og ny vurdering", async () => {
      const error = await validate(
        { begrunnelseFritekst: "" },
        {
          endeligAvgiftValg: MANUELL_ENDELIG_AVGIFT,
          erNyVurdering: true,
        },
      );
      expect(hasError(error, "begrunnelseFritekst", DU_MAA_OPPGI_BEGRUNNELSE.melding)).toBe(true);
    });

    it("skal godta utfylt begrunnelse ved begge betingelser", async () => {
      const error = await validate(
        { begrunnelseFritekst: "Begrunnelse for både manuell avgift og § 12-1" },
        {
          endeligAvgiftValg: MANUELL_ENDELIG_AVGIFT,
          erNyVurdering: true,
        },
      );
      expect(error).toBeNull();
    });
  });

  describe("Maks lengde validering", () => {
    it("skal feile når begrunnelseFritekst er over 4000 tegn", async () => {
      const error = await validate({ begrunnelseFritekst: "a".repeat(4001) }, { endeligAvgiftValg: BEREGNET_AVGIFT });
      expect(error).not.toBeNull();
    });

    it("skal feile når innledningFritekst er over 4000 tegn", async () => {
      const error = await validate({ innledningFritekst: "a".repeat(4001) }, { endeligAvgiftValg: BEREGNET_AVGIFT });
      expect(error).not.toBeNull();
    });

    it("skal godta tekst på nøyaktig 4000 tegn", async () => {
      const error = await validate({ begrunnelseFritekst: "a".repeat(4000) }, { endeligAvgiftValg: BEREGNET_AVGIFT });
      expect(error).toBeNull();
    });
  });

  describe("Edge cases", () => {
    it("skal håndtere manglende context gracefully", async () => {
      const error = await validate({ begrunnelseFritekst: "" }, {});
      expect(error).toBeNull();
    });

    it("skal håndtere undefined erNyVurdering som false", async () => {
      const error = await validate({ begrunnelseFritekst: "" }, { endeligAvgiftValg: BEREGNET_AVGIFT });
      expect(error).toBeNull();
    });
  });
});
