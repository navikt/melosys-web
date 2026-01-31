import { describe, it, expect } from "vitest";
import { OBS_TEKST, HJELPETEKST } from "./tekster";

describe("vurderingFamilie tekster", () => {
  it("OBS_TEKST inneholder info om familieforhold", () => {
    expect(OBS_TEKST).toContain("Familieforhold");
  });

  it("HJELPETEKST inneholder eksempel på begrunnelse", () => {
    expect(HJELPETEKST).toContain("Samboer uten felles barn");
  });
});
