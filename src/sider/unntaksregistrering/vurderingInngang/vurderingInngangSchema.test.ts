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

describe("vurderingInngangSchema (unntaksregistrering)", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingInngangSchema");
    schema = mod.default;
  });

  it("should accept valid values", async () => {
    const errors = await getErrors(schema, {
      fom: "01.01.2024",
      tom: "31.12.2024",
      avsenderland: "SE",
    });
    expect(errors).toEqual([]);
  });

  it("should accept null tom", async () => {
    const errors = await getErrors(schema, {
      fom: "01.01.2024",
      tom: null,
      avsenderland: "SE",
    });
    expect(errors).toEqual([]);
  });

  it("should require fom", async () => {
    const errors = await getErrors(schema, {
      fom: undefined,
      tom: null,
      avsenderland: "SE",
    });
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should require avsenderland", async () => {
    const errors = await getErrors(schema, {
      fom: "01.01.2024",
      tom: null,
      avsenderland: undefined,
    });
    expect(errors.some((e) => e.includes("velge avsenderland"))).toBe(true);
  });

  it("should reject invalid fom date", async () => {
    const errors = await getErrors(schema, {
      fom: "ugyldig",
      tom: null,
      avsenderland: "SE",
    });
    expect(errors.some((e) => e.includes("gyldig dato"))).toBe(true);
  });
});
