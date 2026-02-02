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

describe("vurderingInngangSchema (ftrl)", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./vurderingInngangSchema");
    schema = mod.default;
  });

  it("should accept valid values with land", async () => {
    const errors = await getErrors(schema, {
      fom: "01.01.2024",
      tom: "31.12.2024",
      land: ["SE"],
      flereLandUkjentHvilke: false,
      trygdedekning: "FULL",
    });
    expect(errors).toEqual([]);
  });

  it("should accept flereLandUkjentHvilke without land", async () => {
    const errors = await getErrors(schema, {
      fom: "01.01.2024",
      tom: null,
      land: null,
      flereLandUkjentHvilke: true,
      trygdedekning: "FULL",
    });
    expect(errors).toEqual([]);
  });

  it("should require fom", async () => {
    const errors = await getErrors(schema, {
      fom: undefined,
      tom: null,
      land: ["SE"],
      flereLandUkjentHvilke: false,
      trygdedekning: "FULL",
    });
    expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
  });

  it("should require land when flereLandUkjentHvilke is false", async () => {
    const errors = await getErrors(schema, {
      fom: "01.01.2024",
      tom: null,
      land: [],
      flereLandUkjentHvilke: false,
      trygdedekning: "FULL",
    });
    expect(errors.some((e) => e.includes("velge land"))).toBe(true);
  });

  it("should require trygdedekning", async () => {
    const errors = await getErrors(schema, {
      fom: "01.01.2024",
      tom: null,
      land: ["SE"],
      flereLandUkjentHvilke: false,
      trygdedekning: undefined,
    });
    expect(errors.some((e) => e.includes("velge trygdedekning"))).toBe(true);
  });
});
