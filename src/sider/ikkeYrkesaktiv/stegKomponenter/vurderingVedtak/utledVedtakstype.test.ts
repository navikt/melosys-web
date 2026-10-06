import { describe, it, expect } from "vitest";
import MKV from "../../../../melosyskodeverk";
import { utledVedtakstype } from "./utledVedtakstype";

const { FØRSTEGANGSVEDTAK, ENDRINGSVEDTAK } = MKV.Koder.vedtakstyper;
const { NY_VURDERING, FØRSTEGANG } = MKV.Koder.behandlinger.behandlingstyper;

describe("utledVedtakstype (ikkeYrkesaktiv)", () => {
  it("kodeverdiene testen bruker finnes og er ulike", () => {
    expect(new Set([FØRSTEGANGSVEDTAK, ENDRINGSVEDTAK, NY_VURDERING, FØRSTEGANG].filter(Boolean)).size).toBe(4);
  });

  it("bruker lagret vedtakstype når den finnes, også ved ny vurdering", () => {
    expect(utledVedtakstype(FØRSTEGANGSVEDTAK, NY_VURDERING)).toBe(FØRSTEGANGSVEDTAK);
    expect(utledVedtakstype(ENDRINGSVEDTAK, FØRSTEGANG)).toBe(ENDRINGSVEDTAK);
  });

  it("gir ENDRINGSVEDTAK ved ny vurdering uten lagret vedtakstype", () => {
    expect(utledVedtakstype(null, NY_VURDERING)).toBe(ENDRINGSVEDTAK);
    expect(utledVedtakstype(undefined, NY_VURDERING)).toBe(ENDRINGSVEDTAK);
  });

  it("gir FØRSTEGANGSVEDTAK ellers", () => {
    expect(utledVedtakstype(null, FØRSTEGANG)).toBe(FØRSTEGANGSVEDTAK);
    expect(utledVedtakstype(undefined, undefined)).toBe(FØRSTEGANGSVEDTAK);
  });
});
