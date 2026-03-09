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
  lovvalgsbestemmelse: "ART_12_1",
  forkortLovvalgsperiode: false,
  vedtakstype: null,
  vedtakstypebegrunnelse: null,
  kreverMottakerinstitusjon: false,
  informerUtenlandskTrygdemyndighet: false,
  mottakerinstitusjoner: [],
};

describe("vurderingArbeidTjenestepersonEllerFlyVedtakSchema (Legacy)", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingArbeidTjenestepersonEllerFlyVedtakSchema");
    schema = mod.default;
  });

  it("should accept valid values", async () => {
    const errors = await getErrors(schema, baseValid, { behandlingstype: "FØRSTEGANGSBEHANDLING" });
    expect(errors).toEqual([]);
  });

  it("should require lovvalgsbestemmelse", async () => {
    const errors = await getErrors(
      schema,
      { ...baseValid, lovvalgsbestemmelse: undefined },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors.some((e) => typeof e === "string" && e.includes("bestemmelse"))).toBe(true);
  });

  it("should require vedtakstype for NY_VURDERING", async () => {
    const errors = await getErrors(
      schema,
      { ...baseValid, vedtakstype: undefined },
      { behandlingstype: "NY_VURDERING" },
    );
    expect(errors.some((e) => e.includes("Velg en vedtakstype"))).toBe(true);
  });

  it("should require informerUtenlandskTrygdemyndighet", async () => {
    const errors = await getErrors(
      schema,
      { ...baseValid, informerUtenlandskTrygdemyndighet: undefined },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors.some((e) => e.includes("utenlandsk trygdemyndighet"))).toBe(true);
  });

  it("skal godta vedtaksbrevFritekst på 10000 tegn", async () => {
    const errors = await getErrors(
      schema,
      { ...baseValid, vedtaksbrevFritekst: "a".repeat(10000) },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors).toEqual([]);
  });

  it("skal avvise vedtaksbrevFritekst over 10000 tegn", async () => {
    const errors = await getErrors(
      schema,
      { ...baseValid, vedtaksbrevFritekst: "a".repeat(10001) },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors.some((e) => e.includes("10000 tegn"))).toBe(true);
  });
});
