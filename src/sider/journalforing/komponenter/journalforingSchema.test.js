import { describe, expect, test } from "vitest";
import journalforingSchema from "./journalforingSchema";

describe("journalforingSchema - validering av dokumenttitler", () => {
  // Vi tester kun hoveddokument-skjemaet direkte for å isolere testene
  const getHoveddokumentSchema = () => {
    // Ekstraher hoveddokument-schemat fra journalforingSchema
    return journalforingSchema.fields.hoveddokument;
  };

  test("skal feile når hoveddokument er under redigering og ikke lagret", async () => {
    // Arrange
    const values = {
      tittel: "", // Tomt felt under redigering
      logiskeVedlegg: [],
    };

    const context = {
      registeredFields: {
        tittel: true, // Feltet er registrert (under redigering) - bruker relativ path
      },
      journalforingKnappErTryktPå: true,
    };

    // Act & Assert
    try {
      await getHoveddokumentSchema().validate(values, { context, abortEarly: false });
      expect.fail("Validering skulle ha feilet");
    } catch (error) {
      // Med abortEarly: false får vi alle feil i error.inner
      const feilmeldinger = error.inner?.map((e) => e.message?.melding || e.message) || [
        error.message?.melding || error.message,
      ];
      const harRiktigFeilmelding = feilmeldinger.some((m) => m.includes("Du må lagre tittel på hoveddokument"));
      expect(harRiktigFeilmelding).toBe(true);
    }
  });

  test("skal feile når vedlegg er under redigering og ikke lagret", async () => {
    // Arrange
    const values = {
      tittel: "Søknad om medlemskap",
      logiskeVedlegg: [""], // Tomt vedlegg under redigering
    };

    const context = {
      registeredFields: {
        "logiskeVedlegg[0]": true, // Vedlegget er registrert (under redigering) - bruker relativ path
      },
      journalforingKnappErTryktPå: true,
    };

    // Act & Assert
    try {
      await getHoveddokumentSchema().validate(values, { context, abortEarly: false });
      expect.fail("Validering skulle ha feilet");
    } catch (error) {
      // Med abortEarly: false får vi alle feil i error.inner
      const feilmeldinger = error.inner?.map((e) => e.message?.melding || e.message) || [
        error.message?.melding || error.message,
      ];
      const harRiktigFeilmelding = feilmeldinger.some((m) => m.includes("Du må lagre tittel på vedlegg"));
      expect(harRiktigFeilmelding).toBe(true);
    }
  });

  test("skal godta hoveddokument som ikke er under redigering", async () => {
    // Arrange
    const values = {
      tittel: "Søknad om medlemskap",
      logiskeVedlegg: [],
    };

    const context = {
      registeredFields: {}, // Ingen felt under redigering
      journalforingKnappErTryktPå: true,
    };

    // Act & Assert (skal ikke kaste feil)
    await expect(getHoveddokumentSchema().validate(values, { context })).resolves.toBeDefined();
  });

  test("skal godta vedlegg som ikke er under redigering", async () => {
    // Arrange
    const values = {
      tittel: "Søknad om medlemskap",
      logiskeVedlegg: ["Vedlegg 1", "Vedlegg 2"],
    };

    const context = {
      registeredFields: {}, // Ingen felt under redigering
      journalforingKnappErTryktPå: true,
    };

    // Act & Assert (skal ikke kaste feil)
    await expect(getHoveddokumentSchema().validate(values, { context })).resolves.toBeDefined();
  });

  test("skal godta tom tittel når journalforingKnappErTryktPå er false", async () => {
    // Arrange
    const values = {
      tittel: "",
      logiskeVedlegg: [],
    };

    const context = {
      registeredFields: {
        tittel: true, // Bruker relativ path
      },
      journalforingKnappErTryktPå: false, // Brukeren har ikke trykt på journalføringsknappen
    };

    // Act & Assert (skal ikke kaste feil fra erIkkeUnderRedigering)
    // required() vil fortsatt feile, men det er OK - vi tester bare erIkkeUnderRedigering her
    try {
      await getHoveddokumentSchema().validate(values, { context });
    } catch (error) {
      // required() feiler med "Velg dokumenttittel...", ikke "Du må lagre..."
      const melding = error.message?.melding || error.message;
      expect(melding).not.toContain("Du må lagre");
    }
  });
});
