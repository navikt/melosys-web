import { describe, it, expect } from "vitest";

import {
  YRKESGRUPPE,
  YRKESAKTIVITET,
  SOKKEL,
  SKIP,
  Unntaksperiode,
  VurderingSokkelSkipTyper,
  VurderingYrkesaktivitetTyper,
  VurderingYrkesgruppeTyper,
  SedStatus,
  avklartefaktaKoder,
  Tema,
  Relasjonsrolle,
  StegNavn,
  AvtalelandUtfall,
} from "./koder";

describe("koder", () => {
  it("eksporterer yrkesgruppe-konstanter", () => {
    expect(YRKESGRUPPE).toBe("YRKESGRUPPE");
    expect(YRKESAKTIVITET).toBe("YRKESAKTIVITET");
    expect(SOKKEL).toBe("SOKKEL");
    expect(SKIP).toBe("SKIP");
  });

  it("Unntaksperiode har forventede verdier", () => {
    expect(Unntaksperiode.GODKJENT).toBe("GODKJENT");
    expect(Unntaksperiode.DELVIS_GODKJENT).toBe("DELVIS_GODKJENT");
    expect(Unntaksperiode.AVSLAG).toBe("AVSLAG");
  });

  it("VurderingSokkelSkipTyper har 5 verdier", () => {
    expect(Object.keys(VurderingSokkelSkipTyper)).toHaveLength(5);
  });

  it("VurderingYrkesaktivitetTyper inkluderer ID", () => {
    expect(VurderingYrkesaktivitetTyper.ID).toBe("YRKESAKTIVITET");
  });

  it("VurderingYrkesgruppeTyper inkluderer IKKE_YRKESAKTIV", () => {
    expect(VurderingYrkesgruppeTyper.IKKE_YRKESAKTIV).toBe("IKKE_YRKESAKTIV");
  });

  it("SedStatus har 5 statuser", () => {
    expect(Object.keys(SedStatus)).toHaveLength(5);
    expect(SedStatus.SENDT).toBe("SENDT");
  });

  it("avklartefaktaKoder har YRKESGRUPPE og BOSTEDSLAND", () => {
    expect(avklartefaktaKoder.YRKESGRUPPE).toBe("YRKESGRUPPE");
    expect(avklartefaktaKoder.BOSTEDSLAND).toBe("BOSTEDSLAND");
  });

  it("Tema har MED, UFM og TRY", () => {
    expect(Tema.MED).toBe("Medlemskap");
    expect(Tema.UFM).toBe("Unntak fra medlemskap");
    expect(Tema.TRY).toBe("Trygdeavgift");
  });

  it("Relasjonsrolle inneholder BARN og EKTEFELLE_SAMBOER", () => {
    expect(Relasjonsrolle.BARN).toBe("BARN");
    expect(Relasjonsrolle.EKTEFELLE_SAMBOER).toBe("EKTEFELLE_SAMBOER");
  });

  it("StegNavn enum har forventede verdier", () => {
    expect(StegNavn.INNGANG).toBe("INNGANG");
    expect(StegNavn.VEDTAK).toBe("VEDTAK");
  });

  it("AvtalelandUtfall enum har 3 verdier", () => {
    expect(Object.keys(AvtalelandUtfall)).toHaveLength(3);
  });
});
