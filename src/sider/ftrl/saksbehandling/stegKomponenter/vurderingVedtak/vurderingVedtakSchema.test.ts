import { describe, it, expect, beforeAll } from "vitest";
import type { ValidationError } from "yup";

const getErrors = async (schema: any, values: any, context?: any): Promise<string[]> => {
  try {
    await schema.validate(values, { abortEarly: false, context });
    return [];
  } catch (error) {
    const ve = error as ValidationError;
    return (
      ve.inner?.map((e) => {
        const msg = (e as any).message;
        return typeof msg === "object" ? msg.melding : msg;
      }) || []
    );
  }
};

describe("vurderingVedtakSchema (ftrl)", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingVedtakSchema");
    schema = mod.default;
  });

  it("should accept valid values without ny vurdering", async () => {
    const errors = await getErrors(
      schema,
      {
        begrunnelseFritekst: "Begrunnelse",
        innledningFritekst: null,
        trygdeavgiftFritekst: null,
      },
      { erNyVurdering: false, erManglendeInnbetalingTrygdeavgift: false, erDelvisOpphør: false },
    );
    expect(errors).toEqual([]);
  });

  it("should reject begrunnelseFritekst over 4000 chars", async () => {
    const errors = await getErrors(schema, {
      begrunnelseFritekst: "a".repeat(4001),
    });
    expect(errors.some((e) => e.includes("4000 tegn"))).toBe(true);
  });

  it("should require nyVurderingBakgrunnValg when erNyVurdering", async () => {
    const errors = await getErrors(
      schema,
      {
        begrunnelseFritekst: null,
        nyVurderingBakgrunnValg: undefined,
      },
      { erNyVurdering: true, erManglendeInnbetalingTrygdeavgift: false, erDelvisOpphør: false },
    );
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should not require nyVurderingBakgrunnValg when not erNyVurdering", async () => {
    const errors = await getErrors(
      schema,
      {
        begrunnelseFritekst: null,
        nyVurderingBakgrunnValg: null,
      },
      { erNyVurdering: false, erManglendeInnbetalingTrygdeavgift: false, erDelvisOpphør: false },
    );
    expect(errors.filter((e) => e.includes("Må fylles ut"))).toEqual([]);
  });
});
