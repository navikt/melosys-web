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

describe("vurderingArtikkel16VedtakSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingArtikkel16VedtakSchema");
    schema = mod.default;
  });

  it("should accept valid values without forkortLovvalgsperiode", async () => {
    const errors = await getErrors(
      schema,
      {
        vedtakstype: null,
        vedtakstypebegrunnelse: null,
        forkortLovvalgsperiode: false,
      },
      {
        behandlingstype: "FØRSTEGANGSBEHANDLING",
        lovvalgsperiode: { fomDato: "2024-01-01", tomDato: "2024-12-31" },
      },
    );
    expect(errors).toEqual([]);
  });

  it("should require vedtakstype for NY_VURDERING", async () => {
    const errors = await getErrors(
      schema,
      {
        vedtakstype: undefined,
        vedtakstypebegrunnelse: "Begrunnelse",
        forkortLovvalgsperiode: false,
      },
      {
        behandlingstype: "NY_VURDERING",
        lovvalgsperiode: { fomDato: "2024-01-01", tomDato: "2024-12-31" },
      },
    );
    expect(errors.some((e) => e.includes("Velg en vedtakstype"))).toBe(true);
  });

  it("should require vedtakstypebegrunnelse for NY_VURDERING", async () => {
    const errors = await getErrors(
      schema,
      {
        vedtakstype: "AVSLAG",
        vedtakstypebegrunnelse: undefined,
        forkortLovvalgsperiode: false,
      },
      {
        behandlingstype: "NY_VURDERING",
        lovvalgsperiode: { fomDato: "2024-01-01", tomDato: "2024-12-31" },
      },
    );
    expect(errors.some((e) => e.includes("Oppgi begrunnelse"))).toBe(true);
  });

  it("should require fomDato when forkortLovvalgsperiode is true", async () => {
    const errors = await getErrors(
      schema,
      {
        forkortLovvalgsperiode: true,
        fomDato: undefined,
        tomDato: "30.06.2024",
      },
      {
        behandlingstype: "FØRSTEGANGSBEHANDLING",
        lovvalgsperiode: { fomDato: "2024-01-01", tomDato: "2024-12-31" },
      },
    );
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("skal godta vedtaksbrevFritekst på 4000 tegn", async () => {
    const errors = await getErrors(
      schema,
      {
        forkortLovvalgsperiode: false,
        vedtaksbrevFritekst: "a".repeat(4000),
      },
      {
        behandlingstype: "FØRSTEGANGSBEHANDLING",
        lovvalgsperiode: { fomDato: "2024-01-01", tomDato: "2024-12-31" },
      },
    );
    expect(errors).toEqual([]);
  });

  it("skal avvise vedtaksbrevFritekst over 4000 tegn", async () => {
    const errors = await getErrors(
      schema,
      {
        forkortLovvalgsperiode: false,
        vedtaksbrevFritekst: "a".repeat(4001),
      },
      {
        behandlingstype: "FØRSTEGANGSBEHANDLING",
        lovvalgsperiode: { fomDato: "2024-01-01", tomDato: "2024-12-31" },
      },
    );
    expect(errors.some((e) => e.includes("4000 tegn"))).toBe(true);
  });
});
