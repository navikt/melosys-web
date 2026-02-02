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

describe("vurderingVirksomhetSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingVirksomhetSchema");
    schema = mod.default;
  });

  it("should accept valid values", async () => {
    const errors = await getErrors(schema, {
      valgteVirksomheter: ["virksomhet1"],
    });
    expect(errors).toEqual([]);
  });

  it("should require at least one virksomhet", async () => {
    const errors = await getErrors(schema, {
      valgteVirksomheter: [],
    });
    expect(errors.length).toBeGreaterThan(0);
  });
});
