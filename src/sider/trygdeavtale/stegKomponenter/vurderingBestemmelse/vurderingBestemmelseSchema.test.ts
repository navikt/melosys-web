import { describe, it, expect, beforeAll } from "vitest";
import type { ValidationError } from "yup";

const getErrors = async (schema: any, values: any): Promise<string[]> => {
  try {
    await schema.validate(values, { abortEarly: false });
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

describe("vurderingBestemmelseSchema (trygdeavtale)", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingBestemmelseSchema");
    schema = mod.default;
  });

  it("should accept valid values", async () => {
    const errors = await getErrors(schema, {
      vedtak: "INNVILGET",
      bestemmelse: "ART_12",
      tilleggsbestemmelse: null,
    });
    expect(errors).toEqual([]);
  });

  it("should require vedtak", async () => {
    const errors = await getErrors(schema, {
      vedtak: undefined,
      bestemmelse: "ART_12",
    });
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should require bestemmelse", async () => {
    const errors = await getErrors(schema, {
      vedtak: "INNVILGET",
      bestemmelse: undefined,
    });
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });
});
