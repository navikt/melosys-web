import { describe, it, expect } from "vitest";
import * as Sporsmal from "./sporsmal";

describe("utenlandsoppdraget sporsmal", () => {
  it("erErstatningTidligereUtsendte er definert", () => {
    expect(Sporsmal.erErstatningTidligereUtsendte).toBe("Erstatter arbeidstakeren en annen utsendt person?");
  });

  it("erUtsendelseForOppdragIUtlandet er definert", () => {
    expect(Sporsmal.erUtsendelseForOppdragIUtlandet).toContain("sende en ansatt ut");
  });

  it("erDrattPaaEgetInitiativ er definert", () => {
    expect(Sporsmal.erDrattPaaEgetInitiativ).toContain("eget initiativ");
  });

  it("erFortsattAnsattEtterOppdraget er definert", () => {
    expect(Sporsmal.erFortsattAnsattEtterOppdraget).toContain("etter utenlandsoppdraget");
  });

  it("erAnsattForOppdragIUtlandet er definert", () => {
    expect(Sporsmal.erAnsattForOppdragIUtlandet).toContain("utenlandsoppdraget");
  });

  it("samletUtsendingsperiode er definert", () => {
    expect(Sporsmal.samletUtsendingsperiode).toContain("Utsendingsperioden");
  });
});
