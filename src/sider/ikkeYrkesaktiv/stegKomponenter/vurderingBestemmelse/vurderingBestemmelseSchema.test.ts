import { describe, it, expect, vi, beforeAll } from "vitest";
import type { ValidationError } from "yup";

vi.mock("../../../../melosyskodeverk", () => ({
  default: {
    Koder: {
      innvilgelsesResultat: { INNVILGET: "INNVILGET" },
      lovvalgsbestemmelser: {
        lovvalgbestemmelser_883_2004: { FO_883_2004_ART11_3E: "FO_883_2004_ART11_3E" },
      },
    },
  },
}));

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

describe("vurderingBestemmelseSchema (ikkeYrkesaktiv)", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingBestemmelseSchema");
    schema = mod.default;
  });

  it("should accept valid INNVILGET with bestemmelse", async () => {
    const errors = await getErrors(schema, {
      innvilgelsesResultat: "INNVILGET",
      bestemmelse: "FO_883_2004_ART11_3A",
    });
    expect(errors).toEqual([]);
  });

  it("should require innvilgelsesResultat", async () => {
    const errors = await getErrors(schema, {
      innvilgelsesResultat: undefined,
      bestemmelse: "FO_883_2004_ART11_3A",
    });
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should require bestemmelse when INNVILGET", async () => {
    const errors = await getErrors(schema, {
      innvilgelsesResultat: "INNVILGET",
      bestemmelse: undefined,
    });
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should require ikkeYrkesaktivSituasjontype when bestemmelse is ART11_3E", async () => {
    const errors = await getErrors(schema, {
      innvilgelsesResultat: "INNVILGET",
      bestemmelse: "FO_883_2004_ART11_3E",
      ikkeYrkesaktivSituasjontype: undefined,
    });
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should not require ikkeYrkesaktivSituasjontype for other bestemmelse", async () => {
    const errors = await getErrors(schema, {
      innvilgelsesResultat: "INNVILGET",
      bestemmelse: "FO_883_2004_ART11_3A",
      ikkeYrkesaktivSituasjontype: null,
    });
    expect(errors).toEqual([]);
  });
});
