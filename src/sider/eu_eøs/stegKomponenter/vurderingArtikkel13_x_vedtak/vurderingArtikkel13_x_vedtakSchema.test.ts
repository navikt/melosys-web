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

describe("vurderingArtikkel13_x_vedtakSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingArtikkel13_x_vedtakSchema");
    schema = mod.default;
  });

  it("should accept valid values without forkortLovvalgsperiode", async () => {
    const errors = await getErrors(
      schema,
      {
        forkortLovvalgsperiode: false,
        vedtakstype: null,
        vedtakstypebegrunnelse: null,
        vedtaksbrevFritekst: null,
        fritekstSed: null,
        mottakerinstitusjoner: [],
      },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors).toEqual([]);
  });

  it("should require vedtakstype for NY_VURDERING", async () => {
    const errors = await getErrors(
      schema,
      {
        forkortLovvalgsperiode: false,
        vedtakstype: undefined,
        vedtakstypebegrunnelse: "Begrunnelse",
        mottakerinstitusjoner: [],
      },
      { behandlingstype: "NY_VURDERING" },
    );
    expect(errors.some((e) => e.includes("Velg en vedtakstype"))).toBe(true);
  });

  it("should reject vedtaksbrevFritekst over 4000 chars", async () => {
    const errors = await getErrors(
      schema,
      {
        forkortLovvalgsperiode: false,
        vedtaksbrevFritekst: "a".repeat(4001),
        mottakerinstitusjoner: [],
      },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors.some((e) => e.includes("4000 tegn"))).toBe(true);
  });

  it("should require mottakerinstitusjon id when kreverMottakerinstitusjon", async () => {
    const errors = await getErrors(
      schema,
      {
        forkortLovvalgsperiode: false,
        mottakerinstitusjoner: [{ kreverMottakerinstitusjon: true, id: undefined }],
      },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors.some((e) => e.includes("institusjon kreves"))).toBe(true);
  });
});
