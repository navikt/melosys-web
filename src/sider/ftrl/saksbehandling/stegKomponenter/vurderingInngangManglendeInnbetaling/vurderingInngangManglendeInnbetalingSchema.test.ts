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

describe("vurderingInngangManglendeInnbetalingSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingInngangManglendeInnbetalingSchema");
    schema = mod.default;
  });

  it("should accept valid value", async () => {
    const errors = await getErrors(schema, {
      fullstendigManglendeInnbetaling: "JA",
    });
    expect(errors).toEqual([]);
  });

  it("should require fullstendigManglendeInnbetaling", async () => {
    const errors = await getErrors(schema, {
      fullstendigManglendeInnbetaling: undefined,
    });
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });
});
