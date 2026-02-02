import { describe, it, expect, vi, beforeAll } from "vitest";
import type { ValidationError } from "yup";

// Note: setupYup is loaded via setupTests.js (vitest setupFiles), so custom yup methods are available

// Mock MKV - must be before schema import
vi.mock("../../melosyskodeverk", () => ({
  default: {
    Koder: {
      aktoersroller: {
        BRUKER: "BRUKER",
        VIRKSOMHET: "VIRKSOMHET",
      },
      behandlinger: {
        behandlingstema: {
          ARBEID_FLERE_LAND: "ARBEID_FLERE_LAND",
        },
        behandlingsaarsaktyper: {
          FRITEKST: "FRITEKST",
        },
      },
    },
  },
}));

// Mock skalViseSoknadsperiodeOgLand
vi.mock("../../felleskomponenter/fagsakVelger/opprettSak", () => ({
  skalViseSoknadsperiodeOgLand: (
    sakstype: string,
    sakstema: string,
    behandlingstema: string,
    behandlingstype: string,
  ) => sakstype === "EU_EOS" && !!sakstema && !!behandlingstema && !!behandlingstype,
}));

const getError = async (schema: any, values: any): Promise<string[]> => {
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

// Valid test fnr (mod-11 checked)
const VALID_FNR = "31031779459";

const baseValid = {
  hovedpart: "BRUKER",
  brukerID: VALID_FNR,
  brukerNavn: "Test Person",
  virksomhetOrgnr: null,
  virksomhetNavn: null,
  saksnummer: "-1",
  sakstype: "EU_EOS",
  sakstema: "MEDLEMSKAP",
  behandlingstema: "ARBEID_ETT_LAND",
  behandlingstype: "FØRSTEGANGSBEHANDLING",
  periodeFraOgMed: "01.01.2024",
  periodeTilOgMed: "31.12.2024",
  soknadslandFlereLandUkjentHvilke: false,
  soknadsland: ["NO"],
  mottaksdato: "01.01.2024",
  behandlingsaarsakType: "SØKNAD",
  behandlingsaarsakFritekst: null,
  opprettBehandling: null,
};

describe("opprettnysakSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./opprettnysakSchema");
    schema = mod.default;
  });

  it("should accept valid values for BRUKER", async () => {
    const errors = await getError(schema, baseValid);
    expect(errors).toEqual([]);
  });

  describe("hovedpart", () => {
    it("should require hovedpart", async () => {
      const errors = await getError(schema, { ...baseValid, hovedpart: undefined });
      expect(errors).toContainEqual("Må fylles ut");
    });
  });

  describe("brukerID validation (when hovedpart is BRUKER)", () => {
    it("should require valid fnr/dnr", async () => {
      const errors = await getError(schema, {
        ...baseValid,
        hovedpart: "BRUKER",
        brukerID: "123",
        brukerNavn: "Test",
      });
      expect(errors.some((e) => e.includes("gyldig f.nr."))).toBe(true);
    });

    it("should show error when brukerNavn is missing for valid-length fnr", async () => {
      const errors = await getError(schema, {
        ...baseValid,
        hovedpart: "BRUKER",
        brukerID: VALID_FNR,
        brukerNavn: null,
      });
      expect(errors.some((e) => e.includes("Fant ingen navn"))).toBe(true);
    });
  });

  describe("virksomhetOrgnr validation (when hovedpart is VIRKSOMHET)", () => {
    it("should require valid orgnr", async () => {
      const errors = await getError(schema, {
        ...baseValid,
        hovedpart: "VIRKSOMHET",
        virksomhetOrgnr: "123",
        virksomhetNavn: "Test AS",
        brukerID: null,
        brukerNavn: null,
      });
      expect(errors.some((e) => e.includes("gyldig org.nr."))).toBe(true);
    });

    it("should show error when virksomhetNavn is missing for valid-length orgnr", async () => {
      const errors = await getError(schema, {
        ...baseValid,
        hovedpart: "VIRKSOMHET",
        virksomhetOrgnr: "123456789",
        virksomhetNavn: null,
        brukerID: null,
        brukerNavn: null,
      });
      expect(errors.some((e) => e.includes("Fant ingen navn på dette organisasjonsnummeret"))).toBe(true);
    });
  });

  describe("saksnummer", () => {
    it("should accept -1 (ny sak)", async () => {
      const errors = await getError(schema, { ...baseValid, saksnummer: "-1" });
      expect(errors.filter((e) => e.includes("Velg hvilken sak"))).toEqual([]);
    });

    it("should reject empty string for existing sak", async () => {
      const errors = await getError(schema, {
        ...baseValid,
        saksnummer: "",
        sakstype: null,
        sakstema: null,
        behandlingstema: null,
        behandlingstype: null,
      });
      expect(errors.some((e) => e.includes("Velg hvilken sak"))).toBe(true);
    });
  });

  describe("sakstype/sakstema/behandlingstema/behandlingstype (when ny sak)", () => {
    it("should require sakstype for ny sak", async () => {
      const errors = await getError(schema, { ...baseValid, saksnummer: "-1", sakstype: undefined });
      expect(errors.some((e) => e.includes("Velg sakstype"))).toBe(true);
    });

    it("should require sakstema for ny sak", async () => {
      const errors = await getError(schema, { ...baseValid, saksnummer: "-1", sakstema: undefined });
      expect(errors.some((e) => e.includes("Velg sakstema"))).toBe(true);
    });

    it("should require behandlingstema for ny sak", async () => {
      const errors = await getError(schema, { ...baseValid, saksnummer: "-1", behandlingstema: undefined });
      expect(errors.some((e) => e.includes("Velg behandlingstema"))).toBe(true);
    });

    it("should require behandlingstype for ny sak", async () => {
      const errors = await getError(schema, { ...baseValid, saksnummer: "-1", behandlingstype: undefined });
      expect(errors.some((e) => e.includes("Velg behandlingstype"))).toBe(true);
    });

    it("should not require sakstype for existing sak", async () => {
      const errors = await getError(schema, {
        ...baseValid,
        saksnummer: "123",
        sakstype: null,
        sakstema: null,
        behandlingstema: null,
        behandlingstype: null,
        opprettBehandling: true,
      });
      expect(errors.filter((e) => e.includes("Velg sakstype"))).toEqual([]);
    });
  });

  describe("mottaksdato", () => {
    it("should require mottaksdato", async () => {
      const errors = await getError(schema, { ...baseValid, mottaksdato: undefined });
      expect(errors.some((e) => e.includes("Fyll ut mottaksdato"))).toBe(true);
    });
  });

  describe("behandlingsaarsakType", () => {
    it("should require behandlingsaarsakType", async () => {
      const errors = await getError(schema, { ...baseValid, behandlingsaarsakType: undefined });
      expect(errors.some((e) => e.includes("Velg behandlingsårsak"))).toBe(true);
    });
  });

  describe("behandlingsaarsakFritekst", () => {
    it("should require fritekst when type is FRITEKST", async () => {
      const errors = await getError(schema, {
        ...baseValid,
        behandlingsaarsakType: "FRITEKST",
        behandlingsaarsakFritekst: undefined,
      });
      expect(errors.some((e) => e.includes("behandlingsårsak"))).toBe(true);
    });

    it("should reject fritekst over 25 chars", async () => {
      const errors = await getError(schema, {
        ...baseValid,
        behandlingsaarsakType: "FRITEKST",
        behandlingsaarsakFritekst: "a".repeat(26),
      });
      expect(errors.some((e) => e.includes("maks 25 tegn"))).toBe(true);
    });

    it("should accept fritekst under 25 chars", async () => {
      const errors = await getError(schema, {
        ...baseValid,
        behandlingsaarsakType: "FRITEKST",
        behandlingsaarsakFritekst: "Kort tekst",
      });
      expect(errors.filter((e) => e.includes("25 tegn"))).toEqual([]);
    });
  });

  describe("opprettBehandling (existing sak)", () => {
    it("should reject false when existing sak is selected", async () => {
      const errors = await getError(schema, {
        ...baseValid,
        saksnummer: "123",
        sakstype: null,
        sakstema: null,
        behandlingstema: null,
        behandlingstype: null,
        opprettBehandling: false,
      });
      expect(errors.some((e) => e.includes("Du kan ikke opprette"))).toBe(true);
    });

    it("should accept true when existing sak is selected", async () => {
      const errors = await getError(schema, {
        ...baseValid,
        saksnummer: "123",
        sakstype: null,
        sakstema: null,
        behandlingstema: null,
        behandlingstype: null,
        opprettBehandling: true,
      });
      expect(errors.filter((e) => e.includes("Du kan ikke opprette"))).toEqual([]);
    });
  });
});
