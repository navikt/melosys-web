import { describe, it, expect } from "vitest";
import MKV from "../../../../melosyskodeverk";
import {
  erBruker,
  erVirksomhet,
  erArbeidsgiver,
  erAnnenOrganisasjon,
  erNorskMyndighet,
  erUtenlandskTrygdemyndighet,
  skalViseBrevmalvalg,
} from "./brevMottaker";
import { SendBrevFormValues } from "../types";

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

describe("skalViseBrevmalvalg", () => {
  const medMottaker = (rolle: string, ekstra: Partial<SendBrevFormValues> = {}): SendBrevFormValues =>
    ({ valgtMottaker: { rolle }, ...ekstra }) as SendBrevFormValues;

  it("returnerer false når ingen mottaker er valgt", () => {
    expect(skalViseBrevmalvalg(undefined)).toBe(false);
    expect(skalViseBrevmalvalg({} as SendBrevFormValues)).toBe(false);
  });

  it("returnerer false når valgt mottaker har en feilmelding", () => {
    const formValues = { valgtMottaker: { rolle: BRUKER, feilmelding: { tittel: "Feil" } } } as SendBrevFormValues;
    expect(skalViseBrevmalvalg(formValues)).toBe(false);
  });

  it("returnerer true for vanlig mottaker uten feilmelding", () => {
    expect(skalViseBrevmalvalg(medMottaker(BRUKER))).toBe(true);
    expect(skalViseBrevmalvalg(medMottaker(VIRKSOMHET))).toBe(true);
  });

  it("returnerer false for Annen organisasjon når organisasjon ikke er funnet", () => {
    expect(skalViseBrevmalvalg(medMottaker(ANNEN_ORGANISASJON))).toBe(false);
    expect(skalViseBrevmalvalg(medMottaker(ANNEN_ORGANISASJON, { organisasjonsnummer: "123456789" }))).toBe(false);
  });

  it("returnerer true for Annen organisasjon først når funnet org.nr matcher feltet", () => {
    expect(
      skalViseBrevmalvalg(
        medMottaker(ANNEN_ORGANISASJON, {
          organisasjonsnummer: "123456789",
          organisasjonFunnetForOrgnr: "123456789",
        }),
      ),
    ).toBe(true);
  });

  it("returnerer false når funnet org.nr ikke matcher gjeldende felt (org.nr nettopp endret)", () => {
    expect(
      skalViseBrevmalvalg(
        medMottaker(ANNEN_ORGANISASJON, {
          organisasjonsnummer: "987654321",
          organisasjonFunnetForOrgnr: "123456789",
        }),
      ),
    ).toBe(false);
  });
});
