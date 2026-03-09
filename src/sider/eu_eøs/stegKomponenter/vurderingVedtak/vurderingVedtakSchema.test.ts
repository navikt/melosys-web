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

describe("vurderingVedtakSchema (eu_eøs)", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingVedtakSchema");
    schema = mod.default;
  });

  it("should accept valid values without NY_VURDERING", async () => {
    const errors = await getErrors(
      schema,
      {
        vedtakstype: null,
        vedtakstypebegrunnelse: null,
        kreverMottakerinstitusjon: false,
        vedtaksbrevFritekst: null,
        fritekstSed: null,
      },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors).toEqual([]);
  });

  it("should require kreverMottakerinstitusjon", async () => {
    const errors = await getErrors(
      schema,
      {
        vedtakstype: null,
        vedtakstypebegrunnelse: null,
        kreverMottakerinstitusjon: undefined,
        vedtaksbrevFritekst: null,
        fritekstSed: null,
      },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should require mottakerinstitusjon when kreverMottakerinstitusjon is true", async () => {
    const errors = await getErrors(
      schema,
      {
        vedtakstype: null,
        vedtakstypebegrunnelse: null,
        kreverMottakerinstitusjon: true,
        mottakerinstitusjon: undefined,
        vedtaksbrevFritekst: null,
        fritekstSed: null,
      },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors.some((e) => e.includes("Mottakerinstitusjon kreves"))).toBe(true);
  });

  it("should reject vedtaksbrevFritekst over 10000 chars", async () => {
    const errors = await getErrors(
      schema,
      {
        kreverMottakerinstitusjon: false,
        vedtaksbrevFritekst: "a".repeat(10001),
        fritekstSed: null,
      },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors.some((e) => e.includes("10000 tegn"))).toBe(true);
  });
});
