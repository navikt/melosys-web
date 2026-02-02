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

describe("vurderingVedtakOpphoerSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingVedtakOpphoerSchema");
    schema = mod.default;
  });

  it("should accept valid begrunnelse", async () => {
    const errors = await getErrors(schema, {
      begrunnelseFritekst: "En begrunnelse for opphør",
    });
    expect(errors).toEqual([]);
  });

  it("should accept null begrunnelse", async () => {
    const errors = await getErrors(schema, {
      begrunnelseFritekst: null,
    });
    expect(errors).toEqual([]);
  });

  it("should reject begrunnelse over 4000 chars", async () => {
    const errors = await getErrors(schema, {
      begrunnelseFritekst: "a".repeat(4001),
    });
    expect(errors.some((e) => e.includes("4000 tegn"))).toBe(true);
  });
});
