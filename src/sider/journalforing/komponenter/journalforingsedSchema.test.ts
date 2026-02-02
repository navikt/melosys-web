import { describe, it, expect, beforeAll } from "vitest";
import type { ValidationError } from "yup";

const VALID_FNR = "31031779459";

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

describe("journalforingsedSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./journalforingsedSchema");
    schema = mod.default;
  });

  it("should accept valid fnr with name", async () => {
    const errors = await getErrors(schema, {
      brukerID: VALID_FNR,
      brukerNavn: "Test Person",
    });
    expect(errors).toEqual([]);
  });

  it("should reject blank brukerID", async () => {
    const errors = await getErrors(schema, {
      brukerID: "",
      brukerNavn: undefined,
    });
    expect(errors.some((e) => e.includes("f.nr. eller d-nr."))).toBe(true);
  });

  it("should reject invalid fnr", async () => {
    const errors = await getErrors(schema, {
      brukerID: "12345",
      brukerNavn: undefined,
    });
    expect(errors.some((e) => e.includes("gyldig f.nr. eller d-nr."))).toBe(true);
  });

  it("should show error when brukerNavn is missing for valid-length fnr", async () => {
    const errors = await getErrors(schema, {
      brukerID: VALID_FNR,
      brukerNavn: undefined,
    });
    expect(errors.some((e) => e.includes("Fant ingen navn"))).toBe(true);
  });
});
