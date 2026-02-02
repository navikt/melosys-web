import { describe, it, expect, vi } from "vitest";
import {
  hentResultat,
  oppdaterFritekster,
  oppdaterNyVurderingBakgrunn,
  oppdaterUtfallRegistreringUnntak,
  angiBehandlingsresultattype,
} from "./resultat";

vi.mock("../../utils", () => ({
  getAsJson: vi.fn().mockResolvedValue({}),
  postAsJson: vi.fn().mockResolvedValue({}),
  putAsJson: vi.fn().mockResolvedValue({}),
}));

describe("behandlinger resultat", () => {
  it("hentResultat returnerer promise", () => {
    expect(hentResultat(1)).toBeInstanceOf(Promise);
  });

  it("oppdaterFritekster returnerer promise", () => {
    expect(oppdaterFritekster(1, { begrunnelseFritekst: "test" })).toBeInstanceOf(Promise);
  });

  it("oppdaterNyVurderingBakgrunn returnerer promise", () => {
    expect(oppdaterNyVurderingBakgrunn(1, "bakgrunn")).toBeInstanceOf(Promise);
  });

  it("oppdaterUtfallRegistreringUnntak returnerer promise", () => {
    expect(oppdaterUtfallRegistreringUnntak(1, { utfallRegistreringUnntak: "GODKJENT" })).toBeInstanceOf(Promise);
  });

  it("angiBehandlingsresultattype returnerer promise", () => {
    expect(angiBehandlingsresultattype(1, { type: "INNVILGET" })).toBeInstanceOf(Promise);
  });
});
