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

describe("vurderingVedtak11_3_og_13_3aSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingVedtak11_3_og_13_3aSchema");
    schema = mod.default;
  });

  it("should accept valid values without kortere periode", async () => {
    const errors = await getErrors(schema, {
      lovvalgsbestemmelse: "ART_11_3_A",
      begrunnelseFritekst: "En begrunnelse",
      korterePeriodeChecked: false,
    });
    expect(errors).toEqual([]);
  });

  it("should require lovvalgsbestemmelse", async () => {
    const errors = await getErrors(schema, {
      lovvalgsbestemmelse: undefined,
      korterePeriodeChecked: false,
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should reject begrunnelseFritekst over 4000 chars", async () => {
    const errors = await getErrors(schema, {
      lovvalgsbestemmelse: "ART_11_3_A",
      begrunnelseFritekst: "a".repeat(4001),
      korterePeriodeChecked: false,
    });
    expect(errors.some((e) => e.includes("4000 tegn"))).toBe(true);
  });
});
