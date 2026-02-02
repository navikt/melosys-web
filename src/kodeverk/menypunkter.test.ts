import { describe, it, expect } from "vitest";

import {
  ArbeidsforholdOgInntekt,
  ArbeidsgiverOgVirksomhet,
  Arbeidssteder,
  Fullmektig,
  Medlemskap,
  Periode,
  Person,
  Barnetrygd,
  Utenlandsoppdraget,
  Familieforhold,
  LonnOgGodtgjorelser,
  OvrigOmArbeidstaker,
  OmVirksomhetenINorge,
} from "./menypunkter";

describe("menypunkter", () => {
  it("alle menypunkter har tittel", () => {
    const alle = [
      ArbeidsforholdOgInntekt,
      ArbeidsgiverOgVirksomhet,
      Arbeidssteder,
      Fullmektig,
      Medlemskap,
      Periode,
      Person,
      Barnetrygd,
      Utenlandsoppdraget,
      Familieforhold,
      LonnOgGodtgjorelser,
      OvrigOmArbeidstaker,
      OmVirksomhetenINorge,
    ];

    alle.forEach((m) => {
      expect(m.tittel).toBeDefined();
      expect(m.tittel.length).toBeGreaterThan(0);
    });
  });

  it("alle menypunkter har undertitler-objekt", () => {
    expect(ArbeidsgiverOgVirksomhet.undertitler).toBeDefined();
    expect(Arbeidssteder.undertitler.arbeidsstedLand).toBe("Arbeidssted på land");
  });

  it("Person har annenAdresse undertittel", () => {
    expect(Person.undertitler.annenAdresse).toBe("Annen adresse");
  });

  it("Familieforhold har barn og familie undertitler", () => {
    expect(Familieforhold.undertitler.barnMedPaReisen).toContain("Barn");
    expect(Familieforhold.undertitler.familieMedPaReisen).toContain("Familie");
  });
});
