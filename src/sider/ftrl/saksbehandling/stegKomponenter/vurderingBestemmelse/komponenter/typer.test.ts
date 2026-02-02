import { describe, it, expect } from "vitest";

import { FaktaTypeOverskrifter } from "./typer";

describe("FaktaTypeOverskrifter", () => {
  it("har IKKE_YRKESAKTIV_RELASJON med riktig tittel og kodeverk", () => {
    expect(FaktaTypeOverskrifter.IKKE_YRKESAKTIV_RELASJON.tittel).toBe("Angi brukers relasjon");
    expect(FaktaTypeOverskrifter.IKKE_YRKESAKTIV_RELASJON.kodeverk).toBe("ikkeyrkesaktivrelasjontype");
  });

  it("har IKKE_YRKESAKTIV_FTRL_2_1_OPPHOLD med riktig tittel og kodeverk", () => {
    expect(FaktaTypeOverskrifter.IKKE_YRKESAKTIV_FTRL_2_1_OPPHOLD.tittel).toBe("Angi brukers situasjon");
    expect(FaktaTypeOverskrifter.IKKE_YRKESAKTIV_FTRL_2_1_OPPHOLD.kodeverk).toBe("ikkeyrkesaktivoppholdtype");
  });

  it("har ARBEIDSSITUASJON med riktig tittel og kodeverk", () => {
    expect(FaktaTypeOverskrifter.ARBEIDSSITUASJON.tittel).toBe("Angi brukers situasjon");
    expect(FaktaTypeOverskrifter.ARBEIDSSITUASJON.kodeverk).toBe("arbeidssituasjontype");
  });

  it("har nøyaktig 3 oppføringer", () => {
    expect(Object.keys(FaktaTypeOverskrifter)).toHaveLength(3);
  });
});
