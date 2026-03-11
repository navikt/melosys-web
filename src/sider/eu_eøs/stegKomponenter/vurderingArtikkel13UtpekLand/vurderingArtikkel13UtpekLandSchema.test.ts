import { describe, it, expect, beforeAll } from "vitest";
import type { ValidationError } from "yup";

const getErrors = async (schema: any, values: any, context?: any): Promise<string[]> => {
  try {
    await schema.validate(values, { abortEarly: false, context });
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
  forkortUtpekingsperiode: false,
  kreverMottakerinstitusjon: false,
  fritekstSed: null,
  fritekstOrienteringsbrev: null,
  mottakerinstitusjoner: [],
};

describe("vurderingArtikkel13UtpekLandSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingArtikkel13UtpekLandSchema");
    schema = mod.default;
  });

  it("skal godta gyldige verdier", async () => {
    const errors = await getErrors(schema, baseValid);
    expect(errors).toEqual([]);
  });

  it("skal godta fritekstOrienteringsbrev på 4000 tegn", async () => {
    const errors = await getErrors(schema, {
      ...baseValid,
      fritekstOrienteringsbrev: "a".repeat(4000),
    });
    expect(errors).toEqual([]);
  });

  it("skal avvise fritekstOrienteringsbrev over 4000 tegn", async () => {
    const errors = await getErrors(schema, {
      ...baseValid,
      fritekstOrienteringsbrev: "a".repeat(4001),
    });
    expect(errors.some((e) => e.includes("4000 tegn"))).toBe(true);
  });

  it("skal ikke avvise fritekstOrienteringsbrev på 500 tegn", async () => {
    const errors = await getErrors(schema, {
      ...baseValid,
      fritekstOrienteringsbrev: "a".repeat(500),
    });
    expect(errors).toEqual([]);
  });
});
