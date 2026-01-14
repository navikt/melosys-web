import { describe, it, expect } from "vitest";
import { FANE_STATUS, STEG } from "./typer";

describe("typer - konstanter", () => {
  describe("FANE_STATUS", () => {
    it("skal ha alle påkrevde statuser", () => {
      expect(FANE_STATUS.UBEHANDLET).toBe("UBEHANDLET");
      expect(FANE_STATUS.AKTIV).toBe("AKTIV");
      expect(FANE_STATUS.OK).toBe("OK");
      expect(FANE_STATUS.ADVARSEL).toBe("ADVARSEL");
      expect(FANE_STATUS.FEIL).toBe("FEIL");
    });

    it("skal ha kun 5 statuser", () => {
      const antallStatuser = Object.keys(FANE_STATUS).length;
      expect(antallStatuser).toBe(5);
    });

    it("skal ha unique verdier", () => {
      const verdier = Object.values(FANE_STATUS);
      const uniqueVerdier = [...new Set(verdier)];
      expect(verdier.length).toBe(uniqueVerdier.length);
    });

    it("skal ha streng-verdier", () => {
      Object.values(FANE_STATUS).forEach((verdi) => {
        expect(typeof verdi).toBe("string");
      });
    });
  });

  describe("STEG", () => {
    it("skal ha grunnleggende steg", () => {
      expect(STEG.INNGANG).toBe("INNGANG");
      expect(STEG.VEDTAK).toBe("VEDTAK");
      expect(STEG.YRKESAKTIVITET).toBe("YRKESAKTIVITET");
    });

    it("skal ha artikkel 12 steg", () => {
      expect(STEG.ARTIKKEL_12_1).toBe("ARTIKKEL_12_1");
      expect(STEG.ARTIKKEL_12_2).toBe("ARTIKKEL_12_2");
    });

    it("skal ha artikkel 13 steg", () => {
      expect(STEG.ARTIKKEL_13_1_A_VEDTAK).toBe("ARTIKKEL_13_1_A_VEDTAK");
      expect(STEG.ARTIKKEL_13_1_B_VEDTAK).toBe("ARTIKKEL_13_1_B_VEDTAK");
      expect(STEG.ARTIKKEL_13_1_B_UTPEK_LAND).toBe("ARTIKKEL_13_1_B_UTPEK_LAND");
      expect(STEG.ARTIKKEL_13_2_A_VEDTAK).toBe("ARTIKKEL_13_2_A_VEDTAK");
      expect(STEG.ARTIKKEL_13_2_B).toBe("ARTIKKEL_13_2_B");
      expect(STEG.ARTIKKEL_13_2_B_UTPEK_LAND).toBe("ARTIKKEL_13_2_B_UTPEK_LAND");
      expect(STEG.ARTIKKEL_13_2_B_NORGE).toBe("ARTIKKEL_13_2_B_NORGE");
      expect(STEG.ARTIKKEL_13_3_VEDTAK).toBe("ARTIKKEL_13_3_VEDTAK");
      expect(STEG.ARTIKKEL_13_3_UTPEK_LAND).toBe("ARTIKKEL_13_3_UTPEK_LAND");
      expect(STEG.ARTIKKEL_13_4_VEDTAK).toBe("ARTIKKEL_13_4_VEDTAK");
      expect(STEG.ARTIKKEL_13_4_UTPEK_LAND).toBe("ARTIKKEL_13_4_UTPEK_LAND");
    });

    it("skal ha artikkel 16 steg", () => {
      expect(STEG.ARTIKKEL_16_ANMODNING).toBe("ARTIKKEL_16_ANMODNING");
      expect(STEG.ARTIKKEL_16_MOTTA_SVAR).toBe("ARTIKKEL_16_MOTTA_SVAR");
      expect(STEG.ARTIKKEL_16_VEDTAK).toBe("ARTIKKEL_16_VEDTAK");
    });

    it("skal ha artikkel 11.4 steg", () => {
      expect(STEG.ARTIKKEL_11_4).toBe("ARTIKKEL_11_4");
    });

    it("skal ha FTRL-relaterte steg", () => {
      expect(STEG.YRKESGRUPPE).toBe("YRKESGRUPPE");
      expect(STEG.FORUTGAENDE_MEDLEMSKAP).toBe("FORUTGAENDE_MEDLEMSKAP");
      expect(STEG.ARBEIDSMONSTER).toBe("ARBEIDSMONSTER");
      expect(STEG.UTSENDING).toBe("UTSENDING");
      expect(STEG.VESENTLIG_VIRKSOMHET).toBe("VESENTLIG_VIRKSOMHET");
      expect(STEG.NORMALT_DRIVER_VIRKSOMHET).toBe("NORMALT_DRIVER_VIRKSOMHET");
      expect(STEG.BOSTEDSLAND).toBe("BOSTEDSLAND");
      expect(STEG.FORRETNINGSSTED).toBe("FORRETNINGSSTED");
      expect(STEG.VIRKSOMHETER).toBe("VIRKSOMHETER");
      expect(STEG.SOKKEL_SKIP).toBe("SOKKEL_SKIP");
    });

    it("skal ha utpeking-steg", () => {
      expect(STEG.VURDER_UTPEKING).toBe("VURDER_UTPEKING");
      expect(STEG.VURDER_ARBEIDSLAND).toBe("VURDER_ARBEIDSLAND");
      expect(STEG.GODKJENN_UTPEKING_NORGE).toBe("GODKJENN_UTPEKING_NORGE");
      expect(STEG.GODKJENN_UTPEKING_ANNET_LAND).toBe("GODKJENN_UTPEKING_ANNET_LAND");
      expect(STEG.AVSLAA_UTPEKING).toBe("AVSLAA_UTPEKING");
    });

    it("skal ha spesialsteg", () => {
      expect(STEG.AVSLAG_12_X_OG_16).toBe("AVSLAG_12_X_OG_16");
      expect(STEG.ENDRET_PERIODE).toBe("ENDRE_PERIODE");
      expect(STEG.VIDERESEND).toBe("VIDERESEND");
      expect(STEG.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK).toBe("ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK");
      expect(STEG.MEDFOLGENDE_BARN).toBe("MEDFOLGENDE_BARN");
    });

    it("skal ha unique verdier", () => {
      const verdier = Object.values(STEG);
      const uniqueVerdier = [...new Set(verdier)];
      expect(verdier.length).toBe(uniqueVerdier.length);
    });

    it("skal ha streng-verdier", () => {
      Object.values(STEG).forEach((verdi) => {
        expect(typeof verdi).toBe("string");
      });
    });

    it("skal ha UPPERCASE verdier", () => {
      Object.values(STEG).forEach((verdi) => {
        expect(verdi).toBe(verdi.toUpperCase());
      });
    });

    it("skal ha snake_case eller UPPER_SNAKE_CASE format", () => {
      Object.values(STEG).forEach((verdi) => {
        // Skal kun inneholde bokstaver, tall og underscore
        expect(verdi).toMatch(/^[A-Z0-9_]+$/);
      });
    });
  });

  describe("Type safety og consistency", () => {
    it("FANE_STATUS keys skal matche deres verdier", () => {
      Object.entries(FANE_STATUS).forEach(([key, value]) => {
        expect(key).toBe(value);
      });
    });

    it("STEG keys skal matche deres verdier (med kjent unntak)", () => {
      Object.entries(STEG).forEach(([key, value]) => {
        // ENDRET_PERIODE har feil: key er "ENDRET_PERIODE" men value er "ENDRE_PERIODE"
        // Dette er en kjent inkonsistens i produksjonskoden
        if (key === "ENDRET_PERIODE") {
          expect(value).toBe("ENDRE_PERIODE");
        } else {
          expect(key).toBe(value);
        }
      });
    });

    it("skal kunne bruke FANE_STATUS i switch statements", () => {
      const testStatus = (status: string) => {
        switch (status) {
          case FANE_STATUS.UBEHANDLET:
            return "ubehandlet";
          case FANE_STATUS.AKTIV:
            return "aktiv";
          case FANE_STATUS.OK:
            return "ok";
          case FANE_STATUS.ADVARSEL:
            return "advarsel";
          case FANE_STATUS.FEIL:
            return "feil";
          default:
            return "ukjent";
        }
      };

      expect(testStatus(FANE_STATUS.UBEHANDLET)).toBe("ubehandlet");
      expect(testStatus(FANE_STATUS.AKTIV)).toBe("aktiv");
      expect(testStatus(FANE_STATUS.OK)).toBe("ok");
      expect(testStatus(FANE_STATUS.ADVARSEL)).toBe("advarsel");
      expect(testStatus(FANE_STATUS.FEIL)).toBe("feil");
      expect(testStatus("INVALID")).toBe("ukjent");
    });

    it("skal kunne bruke STEG i switch statements", () => {
      const testSteg = (steg: string) => {
        switch (steg) {
          case STEG.INNGANG:
            return "inngang";
          case STEG.VEDTAK:
            return "vedtak";
          default:
            return "annet";
        }
      };

      expect(testSteg(STEG.INNGANG)).toBe("inngang");
      expect(testSteg(STEG.VEDTAK)).toBe("vedtak");
      expect(testSteg(STEG.YRKESAKTIVITET)).toBe("annet");
    });
  });
});
