import { describe, it, expect, beforeAll } from "vitest";
import * as apiConstants from "./api-constants";

describe("api-constants", () => {
  beforeAll(() => {
    // Mock window.env for tests
    window.env = {
      API_BASE_URL: "http://localhost:3000",
      TRYGDEAVTALE_FLYT_BASE_URL: "http://localhost:3001",
      FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL: "http://localhost:3002",
    };
  });

  describe("API Base URLs", () => {
    it("skal ha API_BASE_URL", () => {
      expect(apiConstants.API_BASE_URL).toBeDefined();
      expect(typeof apiConstants.API_BASE_URL).toBe("string");
    });

    it("skal ha TRYGDEAVTALE_FLYT_BASE_URL", () => {
      expect(apiConstants.TRYGDEAVTALE_FLYT_BASE_URL).toBeDefined();
      expect(typeof apiConstants.TRYGDEAVTALE_FLYT_BASE_URL).toBe("string");
    });

    it("skal ha FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL", () => {
      expect(apiConstants.FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL).toBeDefined();
      expect(typeof apiConstants.FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL).toBe("string");
    });
  });

  describe("API Endpoint Constants", () => {
    it("skal ha ANMODNINGSPERIODER konstant", () => {
      expect(apiConstants.ANMODNINGSPERIODER).toBe("anmodningsperioder");
    });

    it("skal ha AVSLAG konstant", () => {
      expect(apiConstants.AVSLAG).toBe("avslag");
    });

    it("skal ha AVKLARTEFAKTA konstant", () => {
      expect(apiConstants.AVKLARTEFAKTA).toBe("avklartefakta");
    });

    it("skal ha BEHANDLINGER konstant", () => {
      expect(apiConstants.BEHANDLINGER).toBe("behandlinger");
    });

    it("skal ha MOTTATTE_OPPLYSNINGER konstant", () => {
      expect(apiConstants.MOTTATTE_OPPLYSNINGER).toBe("mottatteopplysninger");
    });

    it("skal ha BEHANDLINGSPERIODER konstant", () => {
      expect(apiConstants.BEHANDLINGSPERIODER).toBe("behandlinger");
    });

    it("skal ha BESTEMMELSER konstant", () => {
      expect(apiConstants.BESTEMMELSER).toBe("bestemmelser");
    });

    it("skal ha BREV konstant", () => {
      expect(apiConstants.BREV).toBe("brev");
    });

    it("skal ha HELSEUTGIFTDEKKESPERIODE konstant", () => {
      expect(apiConstants.HELSEUTGIFTDEKKESPERIODE).toBe("helseutgift-dekkes-perioder");
    });

    it("skal ha DOKUMENTER konstant", () => {
      expect(apiConstants.DOKUMENTER).toBe("dokumenter");
    });

    it("skal ha EESSI konstant", () => {
      expect(apiConstants.EESSI).toBe("eessi");
    });

    it("skal ha FAGSAKER konstant", () => {
      expect(apiConstants.FAGSAKER).toBe("fagsaker");
    });

    it("skal ha FEATURETOGGLE konstant", () => {
      expect(apiConstants.FEATURETOGGLE).toBe("featuretoggle");
    });

    it("skal ha FTRL konstant", () => {
      expect(apiConstants.FTRL).toBe("ftrl");
    });

    it("skal ha JOURNALFORING konstant", () => {
      expect(apiConstants.JOURNALFORING).toBe("journalforing");
    });

    it("skal ha KODEVERK konstant", () => {
      expect(apiConstants.KODEVERK).toBe("kodeverk");
    });

    it("skal ha KONTROLL konstant", () => {
      expect(apiConstants.KONTROLL).toBe("kontroll");
    });

    it("skal ha LOVVALGSPERIODER konstant", () => {
      expect(apiConstants.LOVVALGSPERIODER).toBe("lovvalgsperioder");
    });

    it("skal ha LOVVALGSBESTEMMELSER konstant", () => {
      expect(apiConstants.LOVVALGSBESTEMMELSER).toBe("lovvalgsbestemmelser");
    });

    it("skal ha MEDLEM_AV_FOLKETRYGDEN konstant", () => {
      expect(apiConstants.MEDLEM_AV_FOLKETRYGDEN).toBe("medlemavfolketrygden");
    });

    it("skal ha MEDLEMSKAPSPERIODER konstant", () => {
      expect(apiConstants.MEDLEMSKAPSPERIODER).toBe("medlemskapsperioder");
    });

    it("skal ha NOTATER konstant", () => {
      expect(apiConstants.NOTATER).toBe("notater");
    });

    it("skal ha OPPGAVER konstant", () => {
      expect(apiConstants.OPPGAVER).toBe("oppgaver");
    });

    it("skal ha ORGANISASJONER konstant", () => {
      expect(apiConstants.ORGANISASJONER).toBe("organisasjoner");
    });

    it("skal ha PERSONER konstant", () => {
      expect(apiConstants.PERSONER).toBe("personer");
    });

    it("skal ha REGISTRERING konstant", () => {
      expect(apiConstants.REGISTRERING).toBe("registrering");
    });

    it("skal ha SAKSBEHANDLER konstant", () => {
      expect(apiConstants.SAKSBEHANDLER).toBe("saksbehandler");
    });

    it("skal ha SAKSFLYT konstant", () => {
      expect(apiConstants.SAKSFLYT).toBe("saksflyt");
    });

    it("skal ha SAKSOPPLYSNINGER konstant", () => {
      expect(apiConstants.SAKSOPPLYSNINGER).toBe("saksopplysninger");
    });

    it("skal ha STATISTIKK konstant", () => {
      expect(apiConstants.STATISTIKK).toBe("statistikk");
    });

    it("skal ha SVAR konstant", () => {
      expect(apiConstants.SVAR).toBe("svar");
    });

    it("skal ha IVERKSETT konstant", () => {
      expect(apiConstants.IVERKSETT).toBe("iverksett");
    });

    it("skal ha TRYGDEAVGIFT konstant", () => {
      expect(apiConstants.TRYGDEAVGIFT).toBe("trygdeavgift");
    });

    it("skal ha UNNTAKSPERIODER konstant", () => {
      expect(apiConstants.UNNTAKSPERIODER).toBe("unntaksperioder");
    });

    it("skal ha UNNTAKSREGISTRERING konstant", () => {
      expect(apiConstants.UNNTAKSREGISTRERING).toBe("unntaksregistrering");
    });

    it("skal ha UTPEKING konstant", () => {
      expect(apiConstants.UTPEKING).toBe("utpeking");
    });

    it("skal ha UTPEKINGSPERIODER konstant", () => {
      expect(apiConstants.UTPEKINGSPERIODER).toBe("utpekingsperioder");
    });

    it("skal ha VEDTAK konstant", () => {
      expect(apiConstants.VEDTAK).toBe("vedtak");
    });

    it("skal ha VILKAAR konstant", () => {
      expect(apiConstants.VILKAAR).toBe("vilkaar");
    });

    it("skal ha INNGANGSVILKAAR konstant", () => {
      expect(apiConstants.INNGANGSVILKAAR).toBe("inngangsvilkaar");
    });

    it("skal ha SAKSBEHANDLING konstant", () => {
      expect(apiConstants.SAKSBEHANDLING).toBe("saksbehandling");
    });

    it("skal ha AARSAVREGNING konstant", () => {
      expect(apiConstants.AARSAVREGNING).toBe("aarsavregninger");
    });

    it("skal ha EØS_PENSJONIST konstant", () => {
      expect(apiConstants.EØS_PENSJONIST).toBe("eos-pensjonist");
    });

    it("skal ha PENSJONSOPPTJENING konstant", () => {
      expect(apiConstants.PENSJONSOPPTJENING).toBe("pensjonsopptjening");
    });
  });

  describe("Konstant sammenheng", () => {
    it("skal ha BEHANDLINGER og BEHANDLINGSPERIODER som samme verdi", () => {
      expect(apiConstants.BEHANDLINGER).toBe(apiConstants.BEHANDLINGSPERIODER);
    });

    it("skal ha alle endpoint konstanter som strenger", () => {
      const constantValues = Object.entries(apiConstants).filter(
        ([key]) =>
          key !== "API_BASE_URL" &&
          key !== "TRYGDEAVTALE_FLYT_BASE_URL" &&
          key !== "FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL",
      );

      constantValues.forEach(([, value]) => {
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
      });
    });

    it("skal ha unike verdier for de fleste konstanter", () => {
      const allValues = Object.entries(apiConstants)
        .filter(
          ([key]) =>
            key !== "API_BASE_URL" &&
            key !== "TRYGDEAVTALE_FLYT_BASE_URL" &&
            key !== "FAKTURERINGSKOMPONENTEN_FLYT_BASE_URL",
        )
        .map(([, value]) => value);

      // Remove duplicate (BEHANDLINGER and BEHANDLINGSPERIODER have same value)
      const uniqueValues = new Set(allValues);

      // Should have only 1 duplicate (BEHANDLINGER === BEHANDLINGSPERIODER)
      expect(allValues.length - uniqueValues.size).toBe(1);
    });
  });
});
