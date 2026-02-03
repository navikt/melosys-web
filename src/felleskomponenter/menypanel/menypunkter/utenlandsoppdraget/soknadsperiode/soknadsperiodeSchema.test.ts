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

describe("soknadsperiodeSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./soknadsperiodeSchema");
    schema = mod.default;
  });

  it("should accept valid period", async () => {
    const errors = await getErrors(schema, { fom: "01.01.2024", tom: "31.12.2024" });
    expect(errors).toEqual([]);
  });

  it("should accept fom without tom", async () => {
    const errors = await getErrors(schema, { fom: "01.01.2024", tom: null });
    expect(errors).toEqual([]);
  });

  describe("fom", () => {
    it("should require fom", async () => {
      const errors = await getErrors(schema, { fom: undefined, tom: null });
      expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
    });

    it("should reject invalid date", async () => {
      const errors = await getErrors(schema, { fom: "ugyldig", tom: null });
      expect(errors.some((e) => e.includes("gyldig dato"))).toBe(true);
    });
  });

  describe("tom", () => {
    it("should reject invalid date", async () => {
      const errors = await getErrors(schema, { fom: "01.01.2024", tom: "ugyldig" });
      expect(errors.some((e) => e.includes("gyldig dato"))).toBe(true);
    });

    it("should reject tom before fom", async () => {
      const errors = await getErrors(schema, { fom: "01.06.2024", tom: "01.01.2024" });
      expect(errors.some((e) => e.includes("Tidligere enn f.o.m."))).toBe(true);
    });
  });
});
