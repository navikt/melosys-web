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

describe("vurderingAvslaaUtpekingSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingAvslaaUtpekingSchema");
    schema = mod.default;
  });

  it("should accept valid values", async () => {
    const errors = await getErrors(schema, {
      begrunnelseUtenlandskMyndighet: "En god begrunnelse",
      vilSendeAnmodningOmMerInformasjon: true,
      fritekst: "Litt ekstra info",
    });
    expect(errors).toEqual([]);
  });

  it("should require begrunnelseUtenlandskMyndighet", async () => {
    const errors = await getErrors(schema, {
      begrunnelseUtenlandskMyndighet: undefined,
      vilSendeAnmodningOmMerInformasjon: true,
    });
    expect(errors.some((e) => e.includes("Oppgi en begrunnelse"))).toBe(true);
  });

  it("should reject begrunnelse over 500 chars", async () => {
    const errors = await getErrors(schema, {
      begrunnelseUtenlandskMyndighet: "a".repeat(501),
      vilSendeAnmodningOmMerInformasjon: true,
    });
    expect(errors.some((e) => e.includes("500 tegn"))).toBe(true);
  });

  it("should require vilSendeAnmodningOmMerInformasjon", async () => {
    const errors = await getErrors(schema, {
      begrunnelseUtenlandskMyndighet: "Begrunnelse",
      vilSendeAnmodningOmMerInformasjon: undefined,
    });
    expect(errors.some((e) => e.includes("anmodning om mer informasjon"))).toBe(true);
  });

  it("should reject fritekst over 500 chars", async () => {
    const errors = await getErrors(schema, {
      begrunnelseUtenlandskMyndighet: "Begrunnelse",
      vilSendeAnmodningOmMerInformasjon: false,
      fritekst: "a".repeat(501),
    });
    expect(errors.some((e) => e.includes("500 tegn"))).toBe(true);
  });
});
