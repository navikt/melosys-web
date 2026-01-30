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

describe("vurderingVedtakSchema (ikkeYrkesaktiv)", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingVedtakSchema");
    schema = mod.default;
  });

  it("should accept valid values without ny vurdering", async () => {
    const errors = await getErrors(
      schema,
      { nyVurderingBakgrunnValg: null, nyVurderingBakgrunnFritekst: null },
      { erNyVurdering: false },
    );
    expect(errors).toEqual([]);
  });

  it("should require nyVurderingBakgrunnValg when erNyVurdering", async () => {
    const errors = await getErrors(schema, { nyVurderingBakgrunnValg: undefined }, { erNyVurdering: true });
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should not require nyVurderingBakgrunnValg when not erNyVurdering", async () => {
    const errors = await getErrors(schema, { nyVurderingBakgrunnValg: null }, { erNyVurdering: false });
    expect(errors).toEqual([]);
  });
});
