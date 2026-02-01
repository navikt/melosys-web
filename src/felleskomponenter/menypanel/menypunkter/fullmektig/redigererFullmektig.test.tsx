import { describe, it, expect } from "vitest";
import MKV from "../../../../melosyskodeverk";
import { fullmaktStøtterKontaktperson } from "./redigererFullmektig";

const { FULLMEKTIG_SØKNAD, FULLMEKTIG_ARBEIDSGIVER } = MKV.Koder.fullmaktstype;

describe("fullmaktStøtterKontaktperson", () => {
  it("returnerer true når fullmakter inkluderer FULLMEKTIG_SØKNAD", () => {
    expect(fullmaktStøtterKontaktperson([FULLMEKTIG_SØKNAD])).toBe(true);
  });

  it("returnerer true når fullmakter inkluderer FULLMEKTIG_ARBEIDSGIVER", () => {
    expect(fullmaktStøtterKontaktperson([FULLMEKTIG_ARBEIDSGIVER])).toBe(true);
  });

  it("returnerer true når begge er inkludert", () => {
    expect(fullmaktStøtterKontaktperson([FULLMEKTIG_SØKNAD, FULLMEKTIG_ARBEIDSGIVER])).toBe(true);
  });

  it("returnerer false for tom liste", () => {
    expect(fullmaktStøtterKontaktperson([])).toBe(false);
  });

  it("returnerer false for ukjent fullmakt", () => {
    expect(fullmaktStøtterKontaktperson(["UKJENT"])).toBe(false);
  });
});
