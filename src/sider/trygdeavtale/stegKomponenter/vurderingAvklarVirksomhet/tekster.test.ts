import { describe, it, expect } from "vitest";
import { HJELPETEKST, INGEN_VIRKSOMHETER_TEKST } from "./tekster";

describe("vurderingAvklarVirksomhet tekster", () => {
  it("HJELPETEKST inneholder instruksjoner om virksomhet", () => {
    expect(HJELPETEKST).toContain("Velg virksomhet");
    expect(HJELPETEKST).toContain("Arbeidsgiver/virksomhet");
  });

  it("INGEN_VIRKSOMHETER_TEKST inneholder feilmelding", () => {
    expect(INGEN_VIRKSOMHETER_TEKST).toContain("ingen virksomhet registrert");
  });
});
