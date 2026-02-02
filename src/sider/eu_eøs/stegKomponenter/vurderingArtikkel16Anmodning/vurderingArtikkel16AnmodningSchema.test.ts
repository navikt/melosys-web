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

describe("vurderingArtikkel16AnmodningSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingArtikkel16AnmodningSchema");
    schema = mod.default;
  });

  it("should accept valid values with mottakerinstitusjon", async () => {
    const errors = await getErrors(schema, {
      kreverMottakerinstitusjon: true,
      mottakerinstitusjon: "SE:12345",
      fritekstSed: "Litt tekst",
    });
    expect(errors).toEqual([]);
  });

  it("should accept without mottakerinstitusjon when not required", async () => {
    const errors = await getErrors(schema, {
      kreverMottakerinstitusjon: false,
      mottakerinstitusjon: undefined,
      fritekstSed: null,
    });
    expect(errors).toEqual([]);
  });

  it("should require mottakerinstitusjon when kreverMottakerinstitusjon is true", async () => {
    const errors = await getErrors(schema, {
      kreverMottakerinstitusjon: true,
      mottakerinstitusjon: undefined,
    });
    expect(errors.some((e) => e.includes("Velg mottakerinstitusjon"))).toBe(true);
  });

  it("should reject fritekstSed over 500 chars (non-GB)", async () => {
    const errors = await getErrors(schema, {
      kreverMottakerinstitusjon: false,
      fritekstSed: "a".repeat(501),
    });
    expect(errors.some((e) => e.includes("500 tegn"))).toBe(true);
  });
});
