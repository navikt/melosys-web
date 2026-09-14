import { describe, it, expect } from "vitest";
import {
  alleToggleNavn,
  FEATURE_TOGGLE,
  MELOSYS_PENSJONIST,
  ÅRSAVREGNING,
  ÅRSAVREGNING_EØS_PENSJONIST,
  ÅRSAVREGNING_EØS_TJENESTEPERSON,
} from "./toggleNavn";

describe("toggleNavn", () => {
  it("alleToggleNavn inneholder 16 toggles", () => {
    expect(alleToggleNavn).toHaveLength(16);
  });

  it("FEATURE_TOGGLE er definert", () => {
    expect(FEATURE_TOGGLE).toBe("feature-toggle");
  });

  it("alleToggleNavn inkluderer kjente toggles", () => {
    expect(alleToggleNavn).toContain("melosys.pensjonist");
    expect(alleToggleNavn).toContain("melosys.arsavregning");
    expect(alleToggleNavn).toContain("melosys.tekstblokker.dynamisk-placeholder");
  });

  it("eksporterte konstanter matcher verdier i alleToggleNavn", () => {
    expect(alleToggleNavn).toContain(MELOSYS_PENSJONIST);
    expect(alleToggleNavn).toContain(ÅRSAVREGNING);
  });

  it("årsavregningstogglene for EØS har de navnene Unleash er konfigurert med", () => {
    expect(ÅRSAVREGNING_EØS_PENSJONIST).toBe("melosys.arsavregning.eos_pensjonist");
    expect(ÅRSAVREGNING_EØS_TJENESTEPERSON).toBe("melosys.arsavregning.eos_tjenesteperson");
    expect(alleToggleNavn).toContain(ÅRSAVREGNING_EØS_PENSJONIST);
    expect(alleToggleNavn).toContain(ÅRSAVREGNING_EØS_TJENESTEPERSON);
  });
});
