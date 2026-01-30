import { describe, it, expect, vi, beforeAll } from "vitest";
import type { ValidationError } from "yup";

vi.mock("./vurderingVedtak", () => ({
  FRITEKST: "FRITEKST",
}));

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

describe("vurderingVedtakSchema (trygdeavtale)", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingVedtakSchema");
    schema = mod.default;
  });

  it("should accept valid values", async () => {
    const errors = await getErrors(
      schema,
      {
        lovvalgsperiodeFom: "01.01.2024",
        lovvalgsperiodeTom: "31.12.2024",
        begrunnelseFritekst: null,
        innledningFritekst: null,
      },
      { erNyVurdering: false },
    );
    expect(errors).toEqual([]);
  });

  it("should require lovvalgsperiodeFom", async () => {
    const errors = await getErrors(
      schema,
      {
        lovvalgsperiodeFom: undefined,
        lovvalgsperiodeTom: "31.12.2024",
      },
      { erNyVurdering: false },
    );
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should require lovvalgsperiodeTom", async () => {
    const errors = await getErrors(
      schema,
      {
        lovvalgsperiodeFom: "01.01.2024",
        lovvalgsperiodeTom: undefined,
      },
      { erNyVurdering: false },
    );
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should reject begrunnelseFritekst over 4000 chars", async () => {
    const errors = await getErrors(
      schema,
      {
        lovvalgsperiodeFom: "01.01.2024",
        lovvalgsperiodeTom: "31.12.2024",
        begrunnelseFritekst: "a".repeat(4001),
      },
      { erNyVurdering: false },
    );
    expect(errors.some((e) => e.includes("4000 tegn"))).toBe(true);
  });

  it("should require nyVurderingBakgrunn when erNyVurdering", async () => {
    const errors = await getErrors(
      schema,
      {
        lovvalgsperiodeFom: "01.01.2024",
        lovvalgsperiodeTom: "31.12.2024",
        nyVurderingBakgrunn: undefined,
      },
      { erNyVurdering: true },
    );
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });
});
