import { describe, it, expect } from "vitest";
import {
  hentOppsummertFakta,
  lagreVirksomheter,
  lagreInnbetalingsstatus,
  lagreArbeidsland,
  lagreIkkeYrkesaktivOppholdtype,
  lagreIkkeYrkesaktivRelasjontype,
  lagreArbeidssituasjontype,
  lagreUkjentSluttdatoMedlemskapsperiode,
  slettAvklartefakta,
  resetOppsummertFakta,
} from "./operations";
import * as Types from "./types";

describe("oppsummertfakta operations", () => {
  it("hentOppsummertFakta returnerer thunk", () => {
    expect(typeof hentOppsummertFakta(1)).toBe("function");
  });

  it("lagreVirksomheter returnerer thunk", () => {
    expect(typeof lagreVirksomheter(1, {} as any)).toBe("function");
  });

  it("lagreInnbetalingsstatus returnerer thunk", () => {
    expect(typeof lagreInnbetalingsstatus(1, true)).toBe("function");
  });

  it("lagreArbeidsland returnerer thunk", () => {
    expect(typeof lagreArbeidsland(1, {} as any)).toBe("function");
  });

  it("lagreIkkeYrkesaktivOppholdtype returnerer thunk", () => {
    expect(typeof lagreIkkeYrkesaktivOppholdtype(1, "type")).toBe("function");
  });

  it("lagreIkkeYrkesaktivRelasjontype returnerer thunk", () => {
    expect(typeof lagreIkkeYrkesaktivRelasjontype(1, "type")).toBe("function");
  });

  it("lagreArbeidssituasjontype returnerer thunk", () => {
    expect(typeof lagreArbeidssituasjontype(1, "type")).toBe("function");
  });

  it("lagreUkjentSluttdatoMedlemskapsperiode returnerer thunk", () => {
    expect(typeof lagreUkjentSluttdatoMedlemskapsperiode(1, true)).toBe("function");
  });

  it("slettAvklartefakta returnerer thunk", () => {
    expect(typeof slettAvklartefakta(1, "type")).toBe("function");
  });

  it("resetOppsummertFakta returnerer RESET action", () => {
    expect(resetOppsummertFakta()).toEqual({ type: Types.RESET });
  });
});
