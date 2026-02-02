import { describe, it, expect, beforeAll } from "vitest";
import type { ValidationError } from "yup";

const getErrors = async (schema: any, values: any, context?: any): Promise<string[]> => {
  try {
    await schema.validate(values, { abortEarly: false, context });
    return [];
  } catch (error) {
    const ve = error as ValidationError;
    return ve.inner?.map((e) => (e as any).message) || [];
  }
};

describe("unntaksperiodeSchema", () => {
  let endrePeriodeSkjema: any;
  let ikkeGodkjentBegrunnelseSkjema: any;

  beforeAll(async () => {
    const mod = await import("./unntaksperiodeSchema");
    endrePeriodeSkjema = mod.endrePeriodeSkjema;
    ikkeGodkjentBegrunnelseSkjema = mod.ikkeGodkjentBegrunnelseSkjema;
  });

  describe("endrePeriodeSkjema", () => {
    it("should accept valid period", async () => {
      const errors = await getErrors(endrePeriodeSkjema, {
        fom: "01.01.2024",
        tom: "31.12.2024",
      });
      expect(errors).toEqual([]);
    });

    it("should require fom", async () => {
      const errors = await getErrors(endrePeriodeSkjema, {
        fom: undefined,
        tom: "31.12.2024",
      });
      expect(errors.some((e) => typeof e === "string" && e.includes("Startdato er påkrevd"))).toBe(true);
    });

    it("should require tom", async () => {
      const errors = await getErrors(endrePeriodeSkjema, {
        fom: "01.01.2024",
        tom: undefined,
      });
      expect(errors.some((e) => typeof e === "string" && e.includes("Sluttdato er påkrevd"))).toBe(true);
    });

    it("should require fritekst when context says so", async () => {
      const errors = await getErrors(
        endrePeriodeSkjema,
        { fom: "01.01.2024", tom: "31.12.2024", fritekst: undefined },
        { fritekstPakrevd: true },
      );
      expect(errors.some((e) => typeof e === "string" && e.includes("Begrunnelse for endring"))).toBe(true);
    });

    it("should require begrunnelse when context says so", async () => {
      const errors = await getErrors(
        endrePeriodeSkjema,
        { fom: "01.01.2024", tom: "31.12.2024", begrunnelse: undefined },
        { begrunnelsePakrevd: true },
      );
      expect(errors.some((e) => typeof e === "string" && e.includes("Begrunnelse for endret periode"))).toBe(true);
    });
  });

  describe("ikkeGodkjentBegrunnelseSkjema", () => {
    it("should accept valid values", async () => {
      const errors = await getErrors(ikkeGodkjentBegrunnelseSkjema, {
        begrunnelseKoder: ["KODE1"],
        begrunnelseFritekst: "Tekst",
      });
      expect(errors).toEqual([]);
    });

    it("should require at least one begrunnelseKode", async () => {
      const errors = await getErrors(ikkeGodkjentBegrunnelseSkjema, {
        begrunnelseKoder: [],
      });
      expect(errors.some((e) => typeof e === "string" && e.includes("Begrunnelse for avslag"))).toBe(true);
    });

    it("should require fritekst when context says so", async () => {
      const errors = await getErrors(
        ikkeGodkjentBegrunnelseSkjema,
        { begrunnelseKoder: ["KODE1"], begrunnelseFritekst: undefined },
        { fritekstPakrevd: true },
      );
      expect(errors.some((e) => typeof e === "string" && e.includes("Fritekstfelt er påkrevd"))).toBe(true);
    });
  });
});
