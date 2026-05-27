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

const baseValid = {
  fomDato: "01.01.2025",
  tomDato: "31.12.2025",
  bostedLandkode: "NO",
};

describe("vurderingOpplysningerSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingOpplysningerSchema");
    schema = mod.default;
  });

  it("skal godta gyldige verdier", async () => {
    const errors = await getErrors(schema, baseValid);
    expect(errors).toEqual([]);
  });

  it("skal gi 'Du må velge bostedsland' når bostedLandkode mangler", async () => {
    const errors = await getErrors(schema, { ...baseValid, bostedLandkode: "" });
    expect(errors).toContain("Du må velge bostedsland");
  });

  it("skal gi 'Må fylles ut' når fomDato mangler", async () => {
    const errors = await getErrors(schema, { ...baseValid, fomDato: "" });
    expect(errors).toContain("Må fylles ut");
  });

  it("skal gi 'Må fylles ut' når tomDato mangler", async () => {
    const errors = await getErrors(schema, { ...baseValid, tomDato: "" });
    expect(errors).toContain("Må fylles ut");
  });
});
