import { describe, it, expect } from "vitest";

import filtrertMKV from "./filtrertmelosyskodeverk";

describe("filtrertmelosyskodeverk", () => {
  it("eksporterer et objekt med KTObjects, Koder og Terms", () => {
    expect(filtrertMKV).toBeDefined();
    expect(filtrertMKV).toHaveProperty("KTObjects");
    expect(filtrertMKV).toHaveProperty("Koder");
    expect(filtrertMKV).toHaveProperty("Terms");
  });

  it("har fjernet KONTRAKTER_IKKE_NORSK_LOV fra vesentlig_virksomhet_begrunnelser", () => {
    const koder = filtrertMKV.Koder.begrunnelser.vesentlig_virksomhet_begrunnelser;
    expect(koder).not.toHaveProperty("KONTRAKTER_IKKE_NORSK_LOV");
  });

  it("har fjernet ENDRINGER_ARBEIDSSITUASJON fra endretperiode", () => {
    const koder = filtrertMKV.Koder.begrunnelser.endretperiode;
    expect(koder).not.toHaveProperty("ENDRINGER_ARBEIDSSITUASJON");
  });

  it("har fjernet ANNET fra behandlingsaarsaktyper", () => {
    const koder = filtrertMKV.Koder.behandlinger.behandlingsaarsaktyper;
    expect(koder).not.toHaveProperty("ANNET");
  });
});
