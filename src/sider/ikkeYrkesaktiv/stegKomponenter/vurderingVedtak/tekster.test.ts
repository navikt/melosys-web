import { describe, it, expect } from "vitest";
import {
  PERIODE_HJELPETEKST,
  INNLEDNING_FRITEKST_HJELPETEKST,
  BEGRUNNELSE_FRITEKST_HJELPETEKST,
  NY_VURDERING_BAKGRUNN_HJELPETEKST,
} from "./tekster";

describe("ikkeYrkesaktiv vurderingVedtak tekster", () => {
  it("PERIODE_HJELPETEKST er definert", () => {
    expect(PERIODE_HJELPETEKST).toContain("søknadsperiode");
  });

  it("INNLEDNING_FRITEKST_HJELPETEKST inneholder eksempel", () => {
    expect(INNLEDNING_FRITEKST_HJELPETEKST).toContain("Eksempel");
  });

  it("BEGRUNNELSE_FRITEKST_HJELPETEKST er definert", () => {
    expect(BEGRUNNELSE_FRITEKST_HJELPETEKST).toContain("begrunnelse");
  });

  it("NY_VURDERING_BAKGRUNN_HJELPETEKST er definert", () => {
    expect(NY_VURDERING_BAKGRUNN_HJELPETEKST).toContain("innledningstekst");
  });
});
