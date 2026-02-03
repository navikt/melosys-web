import { describe, it, expect } from "vitest";
import MKV from "../../../../melosyskodeverk";
import {
  erBruker,
  erVirksomhet,
  erArbeidsgiver,
  erAnnenOrganisasjon,
  erNorskMyndighet,
  erUtenlandskTrygdemyndighet,
} from "./brevMottaker";

const { BRUKER, ARBEIDSGIVER, VIRKSOMHET, ANNEN_ORGANISASJON, NORSK_MYNDIGHET, UTENLANDSK_TRYGDEMYNDIGHET } =
  MKV.Koder.mottakerroller;

describe("brevMottaker utility functions", () => {
  it("erBruker returnerer true for BRUKER", () => {
    expect(erBruker(BRUKER)).toBe(true);
    expect(erBruker(VIRKSOMHET)).toBe(false);
    expect(erBruker(undefined)).toBe(false);
  });

  it("erVirksomhet returnerer true for VIRKSOMHET", () => {
    expect(erVirksomhet(VIRKSOMHET)).toBe(true);
    expect(erVirksomhet(BRUKER)).toBe(false);
  });

  it("erArbeidsgiver returnerer true for ARBEIDSGIVER", () => {
    expect(erArbeidsgiver(ARBEIDSGIVER)).toBe(true);
    expect(erArbeidsgiver(BRUKER)).toBe(false);
  });

  it("erAnnenOrganisasjon returnerer true for ANNEN_ORGANISASJON", () => {
    expect(erAnnenOrganisasjon(ANNEN_ORGANISASJON)).toBe(true);
    expect(erAnnenOrganisasjon(BRUKER)).toBe(false);
  });

  it("erNorskMyndighet returnerer true for NORSK_MYNDIGHET", () => {
    expect(erNorskMyndighet(NORSK_MYNDIGHET)).toBe(true);
    expect(erNorskMyndighet(BRUKER)).toBe(false);
  });

  it("erUtenlandskTrygdemyndighet returnerer true for UTENLANDSK_TRYGDEMYNDIGHET", () => {
    expect(erUtenlandskTrygdemyndighet(UTENLANDSK_TRYGDEMYNDIGHET)).toBe(true);
    expect(erUtenlandskTrygdemyndighet(BRUKER)).toBe(false);
  });
});
