import { describe, it, expect } from "vitest";
import { feltGrupper } from "./panelFelter";

describe("panelFelter", () => {
  describe("feltGrupper structure", () => {
    it("skal ha personOpplysninger gruppe", () => {
      expect(feltGrupper).toHaveProperty("personOpplysninger");
      expect(feltGrupper.personOpplysninger).toEqual({});
    });

    it("skal ha inntekt gruppe med riktige felter", () => {
      expect(feltGrupper).toHaveProperty("inntekt");
      expect(feltGrupper.inntekt).toHaveProperty("inntektNorskIPerioden");
      expect(feltGrupper.inntekt).toHaveProperty("inntektUtenlandskIPerioden");
      expect(feltGrupper.inntekt.inntektNorskIPerioden).toEqual([]);
      expect(feltGrupper.inntekt.inntektUtenlandskIPerioden).toEqual([]);
    });

    it("skal ha oppholdUtland gruppe med riktige felter", () => {
      expect(feltGrupper).toHaveProperty("oppholdUtland");
      expect(feltGrupper.oppholdUtland).toHaveProperty("studentSemester");
      expect(feltGrupper.oppholdUtland).toHaveProperty("studieLand");
      expect(feltGrupper.oppholdUtland).toHaveProperty("studentFinansiering");
    });

    it("skal ha bosted gruppe med riktige felter", () => {
      expect(feltGrupper).toHaveProperty("bosted");
      expect(feltGrupper.bosted).toHaveProperty("intensjonOmRetur");
      expect(feltGrupper.bosted).toHaveProperty("familiesBosted");
      expect(feltGrupper.bosted.intensjonOmRetur).toEqual([]);
      expect(feltGrupper.bosted.familiesBosted).toEqual([]);
    });

    it("skal ha bekreftelser gruppe med riktige felter", () => {
      expect(feltGrupper).toHaveProperty("bekreftelser");
      expect(feltGrupper.bekreftelser).toHaveProperty("arbeidsgiverBekrefterUtsendelse");
      expect(feltGrupper.bekreftelser).toHaveProperty("arbeidstakerAnsattUnderUtsendelsen");
      expect(feltGrupper.bekreftelser).toHaveProperty("erstatterArbeidstakerenUtsendte");
      expect(feltGrupper.bekreftelser).toHaveProperty("arbeidstakerTidligereUtsendt24Mnd");
      expect(feltGrupper.bekreftelser).toHaveProperty("arbeidsgiverBetalerArbeidsgiveravgift");
      expect(feltGrupper.bekreftelser).toHaveProperty("trygdeavgiftTrukketGjennomSkatt");
      expect(feltGrupper.bekreftelser).toHaveProperty("trygdeavgiftTrukketGjennomSkattDato");
    });

    it("skal ha selvstendigArbeid gruppe med riktige felter", () => {
      expect(feltGrupper).toHaveProperty("selvstendigArbeid");
      expect(feltGrupper.selvstendigArbeid).toHaveProperty("erSelvstendig");
      expect(feltGrupper.selvstendigArbeid).toHaveProperty("selvstendigForetak");
      expect(feltGrupper.selvstendigArbeid.erSelvstendig).toEqual([]);
      expect(feltGrupper.selvstendigArbeid.selvstendigForetak).toEqual([]);
    });

    it("skal ha maritimtArbeid gruppe med riktige felter", () => {
      expect(feltGrupper).toHaveProperty("maritimtArbeid");
      expect(feltGrupper.maritimtArbeid).toHaveProperty("maritimType");
      expect(feltGrupper.maritimtArbeid).toHaveProperty("skipsNavn");
      expect(feltGrupper.maritimtArbeid).toHaveProperty("fartsomrade");
      expect(feltGrupper.maritimtArbeid).toHaveProperty("flaggLand");
      expect(feltGrupper.maritimtArbeid).toHaveProperty("installasjonsLand");
      expect(feltGrupper.maritimtArbeid.maritimType).toEqual([]);
      expect(feltGrupper.maritimtArbeid.skipsNavn).toEqual([]);
      expect(feltGrupper.maritimtArbeid.fartsomrade).toEqual([]);
      expect(feltGrupper.maritimtArbeid.flaggLand).toEqual([]);
      expect(feltGrupper.maritimtArbeid.installasjonsLand).toEqual([]);
    });

    it("skal ha avklartefakta gruppe med riktige felter", () => {
      expect(feltGrupper).toHaveProperty("avklartefakta");
      expect(feltGrupper.avklartefakta).toHaveProperty("avklartefaktaSoknadsland");
      expect(feltGrupper.avklartefakta).toHaveProperty("avklartefaktaPeriodeFraOgMed");
      expect(feltGrupper.avklartefakta).toHaveProperty("avklartefaktaPeriodeTilOgMed");
      expect(feltGrupper.avklartefakta).toHaveProperty("avklartefaktaYrkesgruppe");
    });

    it("skal ha alle 8 hovedgrupper", () => {
      const expectedGroups = [
        "personOpplysninger",
        "inntekt",
        "oppholdUtland",
        "bosted",
        "bekreftelser",
        "selvstendigArbeid",
        "maritimtArbeid",
        "avklartefakta",
      ];

      expect(Object.keys(feltGrupper)).toEqual(expectedGroups);
    });
  });

  describe("validering for bekreftelser felter", () => {
    it("skal ha valideringsfunksjoner for arbeidsgiverBekrefterUtsendelse", () => {
      expect(feltGrupper.bekreftelser.arbeidsgiverBekrefterUtsendelse).toHaveLength(1);
      expect(typeof feltGrupper.bekreftelser.arbeidsgiverBekrefterUtsendelse[0]).toBe("function");
    });

    it("skal ha valideringsfunksjoner for arbeidstakerAnsattUnderUtsendelsen", () => {
      expect(feltGrupper.bekreftelser.arbeidstakerAnsattUnderUtsendelsen).toHaveLength(1);
      expect(typeof feltGrupper.bekreftelser.arbeidstakerAnsattUnderUtsendelsen[0]).toBe("function");
    });

    it("skal ha valideringsfunksjoner for erstatterArbeidstakerenUtsendte", () => {
      expect(feltGrupper.bekreftelser.erstatterArbeidstakerenUtsendte).toHaveLength(1);
      expect(typeof feltGrupper.bekreftelser.erstatterArbeidstakerenUtsendte[0]).toBe("function");
    });

    it("skal ha valideringsfunksjoner for arbeidstakerTidligereUtsendt24Mnd", () => {
      expect(feltGrupper.bekreftelser.arbeidstakerTidligereUtsendt24Mnd).toHaveLength(1);
      expect(typeof feltGrupper.bekreftelser.arbeidstakerTidligereUtsendt24Mnd[0]).toBe("function");
    });

    it("skal ha valideringsfunksjoner for arbeidsgiverBetalerArbeidsgiveravgift", () => {
      expect(feltGrupper.bekreftelser.arbeidsgiverBetalerArbeidsgiveravgift).toHaveLength(1);
      expect(typeof feltGrupper.bekreftelser.arbeidsgiverBetalerArbeidsgiveravgift[0]).toBe("function");
    });

    it("skal ha valideringsfunksjoner for trygdeavgiftTrukketGjennomSkatt", () => {
      expect(feltGrupper.bekreftelser.trygdeavgiftTrukketGjennomSkatt).toHaveLength(1);
      expect(typeof feltGrupper.bekreftelser.trygdeavgiftTrukketGjennomSkatt[0]).toBe("function");
    });

    it("skal ha 2 valideringsfunksjoner for trygdeavgiftTrukketGjennomSkattDato (påkrevet og dato)", () => {
      expect(feltGrupper.bekreftelser.trygdeavgiftTrukketGjennomSkattDato).toHaveLength(2);
      expect(typeof feltGrupper.bekreftelser.trygdeavgiftTrukketGjennomSkattDato[0]).toBe("function");
      expect(typeof feltGrupper.bekreftelser.trygdeavgiftTrukketGjennomSkattDato[1]).toBe("function");
    });
  });

  describe("validering for oppholdUtland felter", () => {
    it("skal ha valideringsfunksjoner for studentSemester", () => {
      expect(feltGrupper.oppholdUtland.studentSemester).toHaveLength(1);
      expect(typeof feltGrupper.oppholdUtland.studentSemester[0]).toBe("function");
    });

    it("skal ha valideringsfunksjoner for studieLand", () => {
      expect(feltGrupper.oppholdUtland.studieLand).toHaveLength(1);
      expect(typeof feltGrupper.oppholdUtland.studieLand[0]).toBe("function");
    });

    it("skal ha valideringsfunksjoner for studentFinansiering", () => {
      expect(feltGrupper.oppholdUtland.studentFinansiering).toHaveLength(1);
      expect(typeof feltGrupper.oppholdUtland.studentFinansiering[0]).toBe("function");
    });
  });

  describe("validering for avklartefakta felter", () => {
    it("skal ha valideringsfunksjon for avklartefaktaPeriodeFraOgMed (påkrevet)", () => {
      expect(feltGrupper.avklartefakta.avklartefaktaPeriodeFraOgMed).toHaveLength(1);
      expect(typeof feltGrupper.avklartefakta.avklartefaktaPeriodeFraOgMed[0]).toBe("function");
    });

    it("skal ha valideringsfunksjon for avklartefaktaPeriodeTilOgMed (påkrevet)", () => {
      expect(feltGrupper.avklartefakta.avklartefaktaPeriodeTilOgMed).toHaveLength(1);
      expect(typeof feltGrupper.avklartefakta.avklartefaktaPeriodeTilOgMed[0]).toBe("function");
    });

    it("skal ikke ha valideringsfunksjoner for avklartefaktaSoknadsland", () => {
      expect(feltGrupper.avklartefakta.avklartefaktaSoknadsland).toEqual([]);
    });

    it("skal ikke ha valideringsfunksjoner for avklartefaktaYrkesgruppe", () => {
      expect(feltGrupper.avklartefakta.avklartefaktaYrkesgruppe).toEqual([]);
    });
  });

  describe("felt uten validering", () => {
    it("skal ha tomme valideringslister for inntekt felter", () => {
      expect(feltGrupper.inntekt.inntektNorskIPerioden).toEqual([]);
      expect(feltGrupper.inntekt.inntektUtenlandskIPerioden).toEqual([]);
    });

    it("skal ha tomme valideringslister for bosted felter", () => {
      expect(feltGrupper.bosted.intensjonOmRetur).toEqual([]);
      expect(feltGrupper.bosted.familiesBosted).toEqual([]);
    });

    it("skal ha tomme valideringslister for selvstendigArbeid felter", () => {
      expect(feltGrupper.selvstendigArbeid.erSelvstendig).toEqual([]);
      expect(feltGrupper.selvstendigArbeid.selvstendigForetak).toEqual([]);
    });

    it("skal ha tomme valideringslister for maritimtArbeid felter", () => {
      expect(feltGrupper.maritimtArbeid.maritimType).toEqual([]);
      expect(feltGrupper.maritimtArbeid.skipsNavn).toEqual([]);
      expect(feltGrupper.maritimtArbeid.fartsomrade).toEqual([]);
      expect(feltGrupper.maritimtArbeid.flaggLand).toEqual([]);
      expect(feltGrupper.maritimtArbeid.installasjonsLand).toEqual([]);
    });
  });

  describe("antall felter per gruppe", () => {
    it("skal ha 0 felter i personOpplysninger", () => {
      expect(Object.keys(feltGrupper.personOpplysninger)).toHaveLength(0);
    });

    it("skal ha 2 felter i inntekt", () => {
      expect(Object.keys(feltGrupper.inntekt)).toHaveLength(2);
    });

    it("skal ha 3 felter i oppholdUtland", () => {
      expect(Object.keys(feltGrupper.oppholdUtland)).toHaveLength(3);
    });

    it("skal ha 2 felter i bosted", () => {
      expect(Object.keys(feltGrupper.bosted)).toHaveLength(2);
    });

    it("skal ha 7 felter i bekreftelser", () => {
      expect(Object.keys(feltGrupper.bekreftelser)).toHaveLength(7);
    });

    it("skal ha 2 felter i selvstendigArbeid", () => {
      expect(Object.keys(feltGrupper.selvstendigArbeid)).toHaveLength(2);
    });

    it("skal ha 5 felter i maritimtArbeid", () => {
      expect(Object.keys(feltGrupper.maritimtArbeid)).toHaveLength(5);
    });

    it("skal ha 19 felter i avklartefakta", () => {
      expect(Object.keys(feltGrupper.avklartefakta)).toHaveLength(19);
    });
  });
});
