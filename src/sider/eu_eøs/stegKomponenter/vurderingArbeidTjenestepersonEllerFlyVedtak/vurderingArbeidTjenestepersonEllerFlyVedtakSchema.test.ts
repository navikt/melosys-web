import { describe, it, expect, vi, beforeAll } from "vitest";
import type { ValidationError } from "yup";

vi.mock("../../../../melosyskodeverk", () => ({
  default: {
    Koder: {
      behandlinger: {
        behandlingstyper: { NY_VURDERING: "NY_VURDERING" },
      },
    },
  },
}));

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
  vedtakstype: null,
  vedtakstypebegrunnelse: null,
  vedtaksbrevFritekst: undefined,
  fritekstSed: undefined,
  kreverMottakerinstitusjon: false,
  mottakerinstitusjon: undefined,
  informerUtenlandskTrygdemyndighet: false,
  mottakerinstitusjoner: [],
};

describe("vurderingArbeidTjenestepersonEllerFlyVedtakSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingArbeidTjenestepersonEllerFlyVedtakSchema");
    schema = mod.default;
  });

  it("should accept valid values", async () => {
    const errors = await getErrors(schema, baseValid, { behandlingstype: "FØRSTEGANGSBEHANDLING" });
    expect(errors).toEqual([]);
  });

  it("should require vedtakstype for NY_VURDERING", async () => {
    const errors = await getErrors(
      schema,
      { ...baseValid, vedtakstype: undefined },
      { behandlingstype: "NY_VURDERING" },
    );
    expect(errors.some((e) => e.includes("Velg en vedtakstype"))).toBe(true);
  });

  it("should require vedtakstypebegrunnelse for NY_VURDERING", async () => {
    const errors = await getErrors(
      schema,
      { ...baseValid, vedtakstype: "AVSLAG", vedtakstypebegrunnelse: undefined },
      { behandlingstype: "NY_VURDERING" },
    );
    expect(errors.some((e) => e.includes("Oppgi begrunnelse"))).toBe(true);
  });

  it("should require mottakerinstitusjon when kreverMottakerinstitusjon is true", async () => {
    const errors = await getErrors(
      schema,
      { ...baseValid, kreverMottakerinstitusjon: true, mottakerinstitusjon: undefined },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors.some((e) => e.includes("Mottakerinstitusjon kreves"))).toBe(true);
  });

  it("should require informerUtenlandskTrygdemyndighet", async () => {
    const errors = await getErrors(
      schema,
      { ...baseValid, informerUtenlandskTrygdemyndighet: undefined },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors.some((e) => e.includes("utenlandsk trygdemyndighet"))).toBe(true);
  });

  it("should require mottakerLand when informerUtenlandskTrygdemyndighet is true", async () => {
    const errors = await getErrors(
      schema,
      { ...baseValid, informerUtenlandskTrygdemyndighet: true, mottakerLand: undefined },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors.some((e) => e.includes("Velg land"))).toBe(true);
  });

  it("should reject vedtaksbrevFritekst over 10000 chars", async () => {
    const errors = await getErrors(
      schema,
      { ...baseValid, vedtaksbrevFritekst: "a".repeat(10001) },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors.some((e) => e.includes("10000 tegn"))).toBe(true);
  });
});
