import { describe, it, expect, vi, beforeAll } from "vitest";
import type { ValidationError } from "yup";

vi.mock("../../../../melosyskodeverk", () => ({
  default: {
    Koder: {
      anmodningsperiodesvartyper: { DELVIS_INNVILGELSE: "DELVIS_INNVILGELSE" },
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

const soknadsperiode = { fom: "2024-01-01", tom: "2024-12-31" };

describe("vurderingArtikkel16MottaSvarSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingArtikkel16MottaSvarSchema");
    schema = mod.default;
  });

  it("should accept empty when not DELVIS_INNVILGELSE", async () => {
    const errors = await getErrors(
      schema,
      { endretPeriode: {} },
      { anmodningsperiodeSvarType: "INNVILGET", soknadsperiode },
    );
    expect(errors).toEqual([]);
  });

  it("should require fom and tom when DELVIS_INNVILGELSE", async () => {
    const errors = await getErrors(
      schema,
      { endretPeriode: { fom: undefined, tom: undefined } },
      { anmodningsperiodeSvarType: "DELVIS_INNVILGELSE", soknadsperiode },
    );
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should accept valid period when DELVIS_INNVILGELSE", async () => {
    const errors = await getErrors(
      schema,
      { endretPeriode: { fom: "01.03.2024", tom: "30.06.2024" } },
      { anmodningsperiodeSvarType: "DELVIS_INNVILGELSE", soknadsperiode },
    );
    expect(errors).toEqual([]);
  });
});
