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

describe("vurderingFamilieSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingFamilieSchema");
    schema = mod.default;
  });

  it("should accept null barn and null ektefelle", async () => {
    const errors = await getErrors(schema, {
      barn: null,
      ektefelle: null,
    });
    expect(errors).toEqual([]);
  });

  it("should accept empty barn object", async () => {
    const errors = await getErrors(schema, {
      barn: {},
      ektefelle: null,
    });
    expect(errors).toEqual([]);
  });

  it("should accept ektefelle with innvilget TRUE", async () => {
    const errors = await getErrors(schema, {
      barn: null,
      ektefelle: {
        innvilget: "TRUE",
        begrunnelse: null,
        fritekst: null,
      },
    });
    expect(errors).toEqual([]);
  });

  it("should require begrunnelse when ektefelle innvilget is FALSE", async () => {
    const errors = await getErrors(schema, {
      barn: null,
      ektefelle: {
        innvilget: "FALSE",
        begrunnelse: undefined,
        fritekst: null,
      },
    });
    expect(errors.some((e) => e.includes("velge begrunnelse"))).toBe(true);
  });
});
