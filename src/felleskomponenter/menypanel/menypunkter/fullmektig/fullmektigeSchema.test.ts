import { describe, it, expect, beforeAll } from "vitest";
import type { ValidationError } from "yup";

const VALID_FNR = "31031779459";
const VALID_ORGNR = "889640782";

const getErrors = async (schema: any, values: any): Promise<string[]> => {
  try {
    await schema.validate(values, { abortEarly: false });
    return [];
  } catch (error) {
    const ve = error as ValidationError;
    return (
      ve.inner?.map((e) => {
        const msg = (e as any).message;
        if (typeof msg === "object" && msg !== null) {
          return msg.melding ?? msg.message?.melding ?? JSON.stringify(msg);
        }
        return msg;
      }) || []
    );
  }
};

const validFullmektig = {
  ident: VALID_FNR,
  fullmakter: ["SIGNERING"],
  type: "PERSON",
  feil: null,
  kontaktOrgnr: null,
};

describe("fullmektigeSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./fullmektigeSchema");
    schema = mod.default;
  });

  it("should accept valid fullmektig with fnr", async () => {
    const errors = await getErrors(schema, { fullmektige: [validFullmektig] });
    expect(errors).toEqual([]);
  });

  it("should accept valid fullmektig with orgnr", async () => {
    const errors = await getErrors(schema, {
      fullmektige: [{ ...validFullmektig, ident: VALID_ORGNR, type: "ORGANISASJON" }],
    });
    expect(errors).toEqual([]);
  });

  describe("ident", () => {
    it("should require ident", async () => {
      const errors = await getErrors(schema, {
        fullmektige: [{ ...validFullmektig, ident: undefined }],
      });
      expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
    });

    it("should reject invalid ident", async () => {
      const errors = await getErrors(schema, {
        fullmektige: [{ ...validFullmektig, ident: "abc" }],
      });
      expect(errors.some((e) => e.includes("gyldig org.nr. eller f.nr."))).toBe(true);
    });

    it("should reject duplicate identer", async () => {
      const errors = await getErrors(schema, {
        fullmektige: [validFullmektig, { ...validFullmektig }],
      });
      expect(errors.some((e) => e.includes("kan ikke være identiske"))).toBe(true);
    });
  });

  describe("fullmakter", () => {
    it("should require at least one fullmakt", async () => {
      const errors = await getErrors(schema, {
        fullmektige: [{ ...validFullmektig, fullmakter: [] }],
      });
      expect(errors.some((e) => e.includes("minst én fullmakt"))).toBe(true);
    });
  });

  describe("type", () => {
    it("should require type", async () => {
      const errors = await getErrors(schema, {
        fullmektige: [{ ...validFullmektig, type: undefined }],
      });
      expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
    });
  });

  describe("feil", () => {
    it("should reject when feil has a value", async () => {
      const errors = await getErrors(schema, {
        fullmektige: [{ ...validFullmektig, feil: "Noe gikk galt" }],
      });
      expect(errors.some((e) => e.includes("Kan ikke ha aktiv feil"))).toBe(true);
    });

    it("should accept null feil", async () => {
      const errors = await getErrors(schema, {
        fullmektige: [{ ...validFullmektig, feil: null }],
      });
      expect(errors.filter((e) => e.includes("feil"))).toEqual([]);
    });
  });

  describe("kontaktOrgnr", () => {
    it("should accept valid orgnr", async () => {
      const errors = await getErrors(schema, {
        fullmektige: [{ ...validFullmektig, kontaktOrgnr: VALID_ORGNR }],
      });
      expect(errors).toEqual([]);
    });

    it("should reject invalid orgnr", async () => {
      const errors = await getErrors(schema, {
        fullmektige: [{ ...validFullmektig, kontaktOrgnr: "123" }],
      });
      expect(errors.some((e) => e.includes("gyldig org.nr."))).toBe(true);
    });

    it("should accept null kontaktOrgnr", async () => {
      const errors = await getErrors(schema, {
        fullmektige: [{ ...validFullmektig, kontaktOrgnr: null }],
      });
      expect(errors).toEqual([]);
    });
  });
});
