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

describe("vurderingInngangSchema (trygdeavtale)", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingInngangSchema");
    schema = mod.default;
  });

  it("should accept valid values", async () => {
    const errors = await getErrors(schema, {
      fom: "01.01.2024",
      tom: "31.12.2024",
      arbeidsland: "US",
    });
    expect(errors).toEqual([]);
  });

  it("should accept null tom", async () => {
    const errors = await getErrors(schema, {
      fom: "01.01.2024",
      tom: null,
      arbeidsland: "US",
    });
    expect(errors).toEqual([]);
  });

  it("should require fom", async () => {
    const errors = await getErrors(schema, {
      fom: undefined,
      tom: null,
      arbeidsland: "US",
    });
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should require arbeidsland", async () => {
    const errors = await getErrors(schema, {
      fom: "01.01.2024",
      tom: null,
      arbeidsland: undefined,
    });
    expect(errors.some((e) => e.includes("velge arbeidsland"))).toBe(true);
  });

  it("should reject tom before fom", async () => {
    const errors = await getErrors(schema, {
      fom: "01.06.2024",
      tom: "01.01.2024",
      arbeidsland: "US",
    });
    expect(errors.some((e) => e.includes("Tidligere enn f.o.m."))).toBe(true);
  });
});
