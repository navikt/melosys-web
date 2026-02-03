import { describe, it, expect, vi, beforeAll } from "vitest";
import type { ValidationError } from "yup";

vi.mock("../../melosyskodeverk", () => ({
  default: {
    Koder: {
      behandlinger: {
        behandlingstema: {
          BESLUTNING_LOVVALG_ANNET_LAND: "BESLUTNING_LOVVALG_ANNET_LAND",
          ARBEID_FLERE_LAND: "ARBEID_FLERE_LAND",
        },
      },
      sakstyper: {
        TRYGDEAVTALE: "TRYGDEAVTALE",
        FTRL: "FTRL",
      },
      mottatteopplysningertyper: {
        SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS: "SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS",
      },
    },
  },
  MKVUtils: {
    erUtsendt: () => false,
    erStorbritanniaKonvBestemmelse: () => false,
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
        if (typeof msg === "object" && msg !== null) {
          return msg.melding ?? JSON.stringify(msg);
        }
        return msg;
      }) || []
    );
  }
};

const defaultContext = {
  behandlingstema: "ARBEID_ETT_LAND",
  mottatteOpplysningerType: "SØKNAD",
  harUnntaksregistreringFlyt: false,
  sakstype: "EU_EOS",
  skalOppgittAdresseValideres: false,
  skalOppgittAdresseGateadresseValideres: false,
};

describe("soknadSchema", () => {
  let schema: any;

  beforeAll(async () => {
    const mod = await import("./soknadSchema");
    schema = mod.default;
  });

  it("should skip validation for BESLUTNING_LOVVALG_ANNET_LAND", async () => {
    const errors = await getErrors(
      schema,
      {},
      {
        ...defaultContext,
        behandlingstema: "BESLUTNING_LOVVALG_ANNET_LAND",
      },
    );
    expect(errors).toEqual([]);
  });

  describe("arbeidsforholdUtland", () => {
    it("should require navn on arbeidsforhold", async () => {
      const errors = await getErrors(
        schema,
        {
          arbeidsforholdUtland: [{ navn: undefined, orgnr: null }],
          soknadsperiodeFom: "01.01.2024",
        },
        defaultContext,
      );
      expect(errors.some((e) => e.includes("Navn kreves"))).toBe(true);
    });

    it("should reject orgnr over 25 chars", async () => {
      const errors = await getErrors(
        schema,
        {
          arbeidsforholdUtland: [{ navn: "Firma AS", orgnr: "a".repeat(26) }],
          soknadsperiodeFom: "01.01.2024",
        },
        defaultContext,
      );
      expect(errors.some((e) => e.includes("25 tegn"))).toBe(true);
    });
  });

  describe("soknadsperiodeFom", () => {
    it("should require soknadsperiodeFom", async () => {
      const errors = await getErrors(schema, { soknadsperiodeFom: undefined }, defaultContext);
      expect(errors.some((e) => e.includes("Må fylles ut"))).toBe(true);
    });

    it("should reject invalid date", async () => {
      const errors = await getErrors(schema, { soknadsperiodeFom: "ugyldig" }, defaultContext);
      expect(errors.some((e) => e.includes("gyldig dato"))).toBe(true);
    });
  });

  describe("foedestedOgLand", () => {
    it("should require foedested and foedeland", async () => {
      const errors = await getErrors(
        schema,
        {
          soknadsperiodeFom: "01.01.2024",
          foedestedOgLand: { foedested: undefined, foedeland: undefined },
        },
        defaultContext,
      );
      expect(errors.some((e) => e.includes("Fødested kreves"))).toBe(true);
      expect(errors.some((e) => e.includes("Fødeland kreves"))).toBe(true);
    });
  });

  describe("juridiskArbeidsgiverNorge andeler", () => {
    it("should reject andel over 100", async () => {
      const errors = await getErrors(
        schema,
        {
          soknadsperiodeFom: "01.01.2024",
          juridiskArbeidsgiverNorge: { andelRekruttertINorge: 101 },
        },
        defaultContext,
      );
      expect(errors.some((e) => e.includes("mellom 0 og 100"))).toBe(true);
    });

    it("should reject andel below 0", async () => {
      const errors = await getErrors(
        schema,
        {
          soknadsperiodeFom: "01.01.2024",
          juridiskArbeidsgiverNorge: { andelOmsetningINorge: -1 },
        },
        defaultContext,
      );
      expect(errors.some((e) => e.includes("mellom 0 og 100"))).toBe(true);
    });
  });

  describe("oppgittAdresse (when skalOppgittAdresseValideres)", () => {
    it("should require postnummer when skalOppgittAdresseValideres", async () => {
      const errors = await getErrors(
        schema,
        {
          soknadsperiodeFom: "01.01.2024",
          oppgittAdressePostnummer: undefined,
        },
        { ...defaultContext, skalOppgittAdresseValideres: true },
      );
      expect(errors.some((e) => e.includes("Postnummer kreves"))).toBe(true);
    });

    it("should not require postnummer when skalOppgittAdresseValideres is false", async () => {
      const errors = await getErrors(
        schema,
        {
          soknadsperiodeFom: "01.01.2024",
          oppgittAdressePostnummer: null,
        },
        { ...defaultContext, skalOppgittAdresseValideres: false },
      );
      expect(errors.filter((e) => e.includes("Postnummer"))).toEqual([]);
    });
  });
});
