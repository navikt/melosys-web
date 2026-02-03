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

describe("vurderingAvklarVirksomhetSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingAvklarVirksomhetSchema");
    schema = mod.default;
  });

  it("should accept valid value", async () => {
    const errors = await getErrors(schema, { virksomhet: "virksomhet1" });
    expect(errors).toEqual([]);
  });

  it("should require virksomhet", async () => {
    const errors = await getErrors(schema, { virksomhet: undefined });
    expect(errors.some((e) => e.includes("velge én virksomhet"))).toBe(true);
  });
});
