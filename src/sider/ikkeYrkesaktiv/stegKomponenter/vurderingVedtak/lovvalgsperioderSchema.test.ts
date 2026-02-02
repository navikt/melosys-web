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

const soknadsperiode = { fom: "2024-01-01", tom: "2024-12-31" };

describe("lovvalgsperioderSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./lovvalgsperioderSchema");
    schema = mod.default;
  });

  it("should accept valid period within soknadsperiode", async () => {
    const errors = await getErrors(schema, { fom: "01.03.2024", tom: "30.06.2024" }, { soknadsperiode });
    expect(errors).toEqual([]);
  });

  it("should require fom", async () => {
    const errors = await getErrors(schema, { fom: undefined, tom: "30.06.2024" }, { soknadsperiode });
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should require tom", async () => {
    const errors = await getErrors(schema, { fom: "01.03.2024", tom: undefined }, { soknadsperiode });
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should reject tom before fom", async () => {
    const errors = await getErrors(schema, { fom: "01.06.2024", tom: "01.03.2024" }, { soknadsperiode });
    expect(errors.some((e) => e.includes("Tidligere enn f.o.m."))).toBe(true);
  });
});
