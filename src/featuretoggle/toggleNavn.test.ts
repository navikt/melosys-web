import { describe, it, expect } from "vitest";
import { alleToggleNavn, FEATURE_TOGGLE, MELOSYS_PENSJONIST, ÅRSAVREGNING } from "./toggleNavn";

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
  });

  it("eksporterte konstanter matcher verdier i alleToggleNavn", () => {
    expect(alleToggleNavn).toContain(MELOSYS_PENSJONIST);
    expect(alleToggleNavn).toContain(ÅRSAVREGNING);
  });
});
