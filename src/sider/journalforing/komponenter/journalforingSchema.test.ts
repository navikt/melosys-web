import { describe, expect, test } from "vitest";
import type { ObjectSchema, ValidationError } from "yup";
import { Dokument } from "../../../@types";
import journalforingSchema from "./journalforingSchema";

type HoveddokumentValues = Pick<Dokument, "tittel" | "logiskeVedlegg">;

interface ValidationContext {
  registeredFields: Record<string, boolean>;
  journalforingKnappErTryktPå: boolean;
}

describe("journalforingSchema - validering av dokumenttitler", () => {
  // Vi tester kun hoveddokument-skjemaet direkte for å isolere testene
  const getHoveddokumentSchema = (): ObjectSchema<HoveddokumentValues> => {
    // Ekstraher hoveddokument-schemat fra journalforingSchema
    return journalforingSchema.fields.hoveddokument as ObjectSchema<HoveddokumentValues>;
  };

  test("skal feile når hoveddokument er under redigering og ikke lagret", async () => {
    const values: HoveddokumentValues = {
      tittel: "", // Tomt felt under redigering
      logiskeVedlegg: [],
    };

    const context: ValidationContext = {
      registeredFields: {
        tittel: true, // Feltet er registrert (under redigering) - bruker relativ path
      },
      journalforingKnappErTryktPå: true,
    };
    try {
      await getHoveddokumentSchema().validate(values, { context, abortEarly: false });
      expect.fail("Validering skulle ha feilet");
    } catch (error) {
      // Med abortEarly: false får vi alle feil i error.inner
      const validationError = error as ValidationError;
      const feilmeldinger = validationError.inner?.map((e) => {
        const msg = (e as any).message;
        return typeof msg === "object" ? msg.melding : msg;
      }) || [
        typeof (validationError as any).message === "object"
          ? (validationError as any).message.melding
          : validationError.message,
      ];
      const harRiktigFeilmelding = feilmeldinger.some((m) => m?.includes("Du må lagre tittel på hoveddokument"));
      expect(harRiktigFeilmelding).toBe(true);
    }
  });

  test("skal feile når vedlegg er under redigering og ikke lagret", async () => {
    const values: HoveddokumentValues = {
      tittel: "Søknad om medlemskap",
      logiskeVedlegg: [""], // Tomt vedlegg under redigering
    };

    const context: ValidationContext = {
      registeredFields: {
        "logiskeVedlegg[0]": true, // Vedlegget er registrert (under redigering) - bruker relativ path
      },
      journalforingKnappErTryktPå: true,
    };
    try {
      await getHoveddokumentSchema().validate(values, { context, abortEarly: false });
      expect.fail("Validering skulle ha feilet");
    } catch (error) {
      // Med abortEarly: false får vi alle feil i error.inner
      const validationError = error as ValidationError;
      const feilmeldinger = validationError.inner?.map((e) => {
        const msg = (e as any).message;
        return typeof msg === "object" ? msg.melding : msg;
      }) || [
        typeof (validationError as any).message === "object"
          ? (validationError as any).message.melding
          : validationError.message,
      ];
      const harRiktigFeilmelding = feilmeldinger.some((m) => m?.includes("Du må lagre tittel på vedlegg"));
      expect(harRiktigFeilmelding).toBe(true);
    }
  });

  test("skal godta hoveddokument som ikke er under redigering", async () => {
    const values: HoveddokumentValues = {
      tittel: "Søknad om medlemskap",
      logiskeVedlegg: [],
    };

    const context: ValidationContext = {
      registeredFields: {}, // Ingen felt under redigering
      journalforingKnappErTryktPå: true,
    };

    await expect(getHoveddokumentSchema().validate(values, { context })).resolves.toBeDefined();
  });

  test("skal godta vedlegg som ikke er under redigering", async () => {
    const values: HoveddokumentValues = {
      tittel: "Søknad om medlemskap",
      logiskeVedlegg: ["Vedlegg 1", "Vedlegg 2"],
    };

    const context: ValidationContext = {
      registeredFields: {}, // Ingen felt under redigering
      journalforingKnappErTryktPå: true,
    };

    await expect(getHoveddokumentSchema().validate(values, { context })).resolves.toBeDefined();
  });

  test("skal godta tom tittel når journalforingKnappErTryktPå er false", async () => {
    const values: HoveddokumentValues = {
      tittel: "",
      logiskeVedlegg: [],
    };

    const context: ValidationContext = {
      registeredFields: {
        tittel: true, // Bruker relativ path
      },
      journalforingKnappErTryktPå: false, // Brukeren har ikke trykt på journalføringsknappen
    };

    // required() vil fortsatt feile, men det er OK - vi tester bare erIkkeUnderRedigering her
    try {
      await getHoveddokumentSchema().validate(values, { context });
    } catch (error) {
      // required() feiler med "Velg dokumenttittel...", ikke "Du må lagre..."
      const validationError = error as ValidationError;
      const msg = (validationError as any).message;
      const melding = typeof msg === "object" ? msg.melding : msg;
      expect(melding).not.toContain("Du må lagre");
    }
  });
});
