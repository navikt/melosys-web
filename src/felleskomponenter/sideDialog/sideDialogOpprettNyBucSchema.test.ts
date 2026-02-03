import { describe, it, expect, beforeAll } from "vitest";
import type { ValidationError } from "yup";

const getErrors = async (schema: any, values: any): Promise<string[]> => {
  try {
    await schema.validate(values, { abortEarly: false });
    return [];
  } catch (error) {
    const ve = error as ValidationError;
    return ve.inner?.map((e) => e.message) || [];
  }
};

describe("sideDialogOpprettNyBucSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./sideDialogOpprettNyBucSchema");
    schema = mod.default;
  });

  it("should accept valid values", async () => {
    const errors = await getErrors(schema, {
      buc: "LA_BUC_01",
      land: ["SE"],
      mottakerinstitusjoner: ["SE:12345"],
    });
    expect(errors).toEqual([]);
  });

  describe("buc", () => {
    it("should require buc", async () => {
      const errors = await getErrors(schema, {
        buc: undefined,
        land: ["SE"],
        mottakerinstitusjoner: ["SE:12345"],
      });
      expect(errors.some((e) => e.includes("velge BUC"))).toBe(true);
    });
  });

  describe("land", () => {
    it("should require at least one land", async () => {
      const errors = await getErrors(schema, {
        buc: "LA_BUC_01",
        land: [],
        mottakerinstitusjoner: ["SE:12345"],
      });
      expect(errors.some((e) => e.includes("velge land"))).toBe(true);
    });
  });

  describe("mottakerinstitusjoner", () => {
    it("should require at least one mottakerinstitusjon", async () => {
      const errors = await getErrors(schema, {
        buc: "LA_BUC_01",
        land: ["SE"],
        mottakerinstitusjoner: [],
      });
      expect(errors.some((e) => e.includes("velge mottakerinstitusjon"))).toBe(true);
    });
  });
});
