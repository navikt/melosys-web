import { describe, it, expect } from "vitest";
import MKV from "../../../../melosyskodeverk";
import { utledVedtakstype } from "./utledVedtakstype";

const { FØRSTEGANGSVEDTAK, ENDRINGSVEDTAK } = MKV.Koder.vedtakstyper;
const { NY_VURDERING, FØRSTEGANG, KLAGE, ENDRET_PERIODE } = MKV.Koder.behandlinger.behandlingstyper;

describe("utledVedtakstype (ikkeYrkesaktiv)", () => {
  it("bruker lagret vedtakstype når den finnes, også ved ny vurdering", () => {
    expect(utledVedtakstype(FØRSTEGANGSVEDTAK, NY_VURDERING)).toBe(FØRSTEGANGSVEDTAK);
    expect(utledVedtakstype(ENDRINGSVEDTAK, FØRSTEGANG)).toBe(ENDRINGSVEDTAK);
  });

  it("gir ENDRINGSVEDTAK ved ny vurdering uten lagret vedtakstype", () => {
    expect(utledVedtakstype(null, NY_VURDERING)).toBe("ENDRINGSVEDTAK");
    expect(utledVedtakstype(undefined, NY_VURDERING)).toBe("ENDRINGSVEDTAK");
  });

  it.each([
    ["FØRSTEGANG", FØRSTEGANG],
    ["KLAGE", KLAGE],
    ["ENDRET_PERIODE", ENDRET_PERIODE],
    ["tom streng (behandlingstype mangler)", ""],
    ["undefined", undefined],
  ])("gir FØRSTEGANGSVEDTAK for behandlingstype %s uten lagret vedtakstype", (_, behandlingstype) => {
    expect(utledVedtakstype(null, behandlingstype)).toBe("FØRSTEGANGSVEDTAK");
  });
});
