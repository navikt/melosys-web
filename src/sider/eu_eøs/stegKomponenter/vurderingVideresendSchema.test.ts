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

describe("vurderingVideresendSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingVideresendSchema");
    schema = mod.default;
  });

  it("should accept valid values when mottakerinstitusjon is required", async () => {
    const errors = await getErrors(schema, {
      kreverMottakerinstitusjon: true,
      mottakerinstitusjon: "SE:12345",
    });
    expect(errors).toEqual([]);
  });

  it("should accept missing mottakerinstitusjon when not required", async () => {
    const errors = await getErrors(schema, {
      kreverMottakerinstitusjon: false,
      mottakerinstitusjon: undefined,
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

  it("skal godta orienteringsbrevFritekst på 4000 tegn", async () => {
    const errors = await getErrors(schema, {
      kreverMottakerinstitusjon: false,
      orienteringsbrevFritekst: "a".repeat(4000),
    });
    expect(errors).toEqual([]);
  });

  it("skal avvise orienteringsbrevFritekst over 4000 tegn", async () => {
    const errors = await getErrors(schema, {
      kreverMottakerinstitusjon: false,
      orienteringsbrevFritekst: "a".repeat(4001),
    });
    expect(errors.some((e) => e.includes("4000 tegn"))).toBe(true);
  });

  it("skal godta ytterligereInformasjonSed på 500 tegn", async () => {
    const errors = await getErrors(schema, {
      kreverMottakerinstitusjon: false,
      ytterligereInformasjonSed: "a".repeat(500),
    });
    expect(errors).toEqual([]);
  });

  it("skal avvise ytterligereInformasjonSed over 500 tegn", async () => {
    const errors = await getErrors(schema, {
      kreverMottakerinstitusjon: false,
      ytterligereInformasjonSed: "a".repeat(501),
    });
    expect(errors.some((e) => e.includes("500 tegn"))).toBe(true);
  });
});
