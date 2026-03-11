import { describe, it, expect, vi, beforeAll } from "vitest";
import type { ValidationError } from "yup";

vi.mock("../../../melosyskodeverk", () => ({
  default: {
    Koder: {
      behandlinger: {
        behandlingstyper: {
          NY_VURDERING: "NY_VURDERING",
        },
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

describe("vurderingAvslag12_x_og_16Schema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingAvslag12_x_og_16Schema");
    schema = mod.default;
  });

  it("should accept valid values for NY_VURDERING", async () => {
    const errors = await getErrors(
      schema,
      { vedtakstype: "AVSLAG", vedtakstypebegrunnelse: "Begrunnelse" },
      { behandlingstype: "NY_VURDERING" },
    );
    expect(errors).toEqual([]);
  });

  it("should not require vedtakstype for non-NY_VURDERING", async () => {
    const errors = await getErrors(
      schema,
      { vedtakstype: null, vedtakstypebegrunnelse: null },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors).toEqual([]);
  });

  it("should require vedtakstype for NY_VURDERING", async () => {
    const errors = await getErrors(
      schema,
      { vedtakstype: undefined, vedtakstypebegrunnelse: "Begrunnelse" },
      { behandlingstype: "NY_VURDERING" },
    );
    expect(errors.some((e) => e.includes("Velg en vedtakstype"))).toBe(true);
  });

  it("should require vedtakstypebegrunnelse for NY_VURDERING", async () => {
    const errors = await getErrors(
      schema,
      { vedtakstype: "AVSLAG", vedtakstypebegrunnelse: undefined },
      { behandlingstype: "NY_VURDERING" },
    );
    expect(errors.some((e) => e.includes("Oppgi begrunnelse"))).toBe(true);
  });

  it("skal godta vedtaksbrevFritekst på 4000 tegn", async () => {
    const errors = await getErrors(
      schema,
      { vedtakstype: null, vedtakstypebegrunnelse: null, vedtaksbrevFritekst: "a".repeat(4000) },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors).toEqual([]);
  });

  it("skal avvise vedtaksbrevFritekst over 4000 tegn", async () => {
    const errors = await getErrors(
      schema,
      { vedtakstype: null, vedtakstypebegrunnelse: null, vedtaksbrevFritekst: "a".repeat(4001) },
      { behandlingstype: "FØRSTEGANGSBEHANDLING" },
    );
    expect(errors.some((e) => e.includes("4000 tegn"))).toBe(true);
  });
});
