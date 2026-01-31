import { describe, it, expect } from "vitest";
import * as Sporsmal from "./sporsmal";

describe("ovrigOmArbeidstaker sporsmal", () => {
  it("harLoennetArbeidMinstEnMndFoerUtsending er definert", () => {
    expect(Sporsmal.harLoennetArbeidMinstEnMndFoerUtsending).toContain("lønnet arbeid");
  });

  it("beskrivelseArbeidSisteMnd er definert", () => {
    expect(Sporsmal.beskrivelseArbeidSisteMnd).toContain("siste måneden");
  });

  it("beskrivelseAnnetArbeid er definert", () => {
    expect(Sporsmal.beskrivelseAnnetArbeid).toContain("situasjonen");
  });

  it("harAndreArbeidsgivereIUtsendingsperioden er definert", () => {
    expect(Sporsmal.harAndreArbeidsgivereIUtsendingsperioden).toContain("selvstendig virksomhet");
  });

  it("erSkattepliktig er definert", () => {
    expect(Sporsmal.erSkattepliktig).toContain("Skattepliktig");
  });

  it("mottarYtelserNorge er definert", () => {
    expect(Sporsmal.mottarYtelserNorge).toContain("NAV");
  });

  it("mottarYtelserUtlandet er definert", () => {
    expect(Sporsmal.mottarYtelserUtlandet).toContain("utlandet");
  });
});
