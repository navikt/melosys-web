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

describe("saksplukkerSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./saksplukkerSchema");
    schema = mod.default;
  });

  it("should accept valid values", async () => {
    const errors = await getErrors(schema, {
      sakstype: "EU_EOS",
      sakstema: "MEDLEMSKAP",
      behandlingstema: "ARBEID_ETT_LAND",
    });
    expect(errors).toEqual([]);
  });

  it("should require sakstype", async () => {
    const errors = await getErrors(schema, {
      sakstype: undefined,
      sakstema: "MEDLEMSKAP",
      behandlingstema: "ARBEID_ETT_LAND",
    });
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should require sakstema", async () => {
    const errors = await getErrors(schema, {
      sakstype: "EU_EOS",
      sakstema: undefined,
      behandlingstema: "ARBEID_ETT_LAND",
    });
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should require behandlingstema", async () => {
    const errors = await getErrors(schema, {
      sakstype: "EU_EOS",
      sakstema: "MEDLEMSKAP",
      behandlingstema: undefined,
    });
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });
});
