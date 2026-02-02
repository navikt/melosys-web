import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../../../../melosyskodeverk";

vi.mock("../../../../../../navFrontend", () => ({
  Alert: ({ children, variant }: any) => <div data-variant={variant}>{children}</div>,
}));

vi.mock("../../../../../../utils", () => ({
  _isEmpty: (arr: any[]) => !arr || arr.length === 0,
  dato: {
    sorterEtterNorskFomDato: (a: any, b: any) => a.fomDato.localeCompare(b.fomDato),
    formatterDatoTilISO: (d: string) => d,
    erFør: (a: string, b: string) => a < b,
    erEtter: (a: string, b: string) => a > b,
    erLikeDatoer: (a: string, b: string) => a === b,
    plussEnDag: (d: string) => {
      const date = new Date(d);
      date.setDate(date.getDate() + 1);
      return date.toISOString().slice(0, 10);
    },
    perioderOverlapper: (fom1: string, tom1: string, fom2: string, tom2: string) => fom1 <= tom2 && fom2 <= tom1,
    datoDiffNorskFormat: (_fom: string, _tom: string, _unit: string) => 0.5,
    norskStringTilDate: (d: string) => new Date(d),
  },
}));

vi.mock("../../../../../../felleskomponenter/alertmeldinger", () => ({
  IngenFlytMelding: () => <div>IngenFlytMelding</div>,
}));

import { finnAktivFeilmelding, feilMeldingBlokkerer, tillattMedManglendeSluttDato, Feilmelding } from "./feilmeldinger";

const { AVSLAATT, INNVILGET } = MKV.Koder.innvilgelsesResultat;

const lagPeriode = (overrides: Record<string, any> = {}) => ({
  ny: false,
  periodeId: 1,
  fomDato: "2024-01-01",
  tomDato: "2024-06-01",
  innvilgelsesResultat: INNVILGET,
  bestemmelse: "FTRL_KAP2_2_1",
  trygdedekning: "FULL",
  ...overrides,
});

describe("feilMeldingBlokkerer", () => {
  it("returnerer true for INGEN_MEDLEMSKAPSPERIODER", () => {
    expect(feilMeldingBlokkerer("INGEN_MEDLEMSKAPSPERIODER")).toBe(true);
  });

  it("returnerer true for OVERLAPP_I_INNVILGEDE_PERIODER", () => {
    expect(feilMeldingBlokkerer("OVERLAPP_I_INNVILGEDE_PERIODER")).toBe(true);
  });

  it("returnerer true for PERIODE_OVERSTIGER_12_MND", () => {
    expect(feilMeldingBlokkerer("PERIODE_OVERSTIGER_12_MND")).toBe(true);
  });

  it("returnerer false for INGEN_OPPHØRTE_PERIODER (advarsel)", () => {
    expect(feilMeldingBlokkerer("INGEN_OPPHØRTE_PERIODER")).toBe(false);
  });

  it("returnerer false for BESTEMMELSE_FOR_FAMILIEMEDLEMMER", () => {
    expect(feilMeldingBlokkerer("BESTEMMELSE_FOR_FAMILIEMEDLEMMER")).toBe(false);
  });

  it("returnerer false for undefined", () => {
    expect(feilMeldingBlokkerer(undefined)).toBe(false);
  });
});

describe("tillattMedManglendeSluttDato", () => {
  it("returnerer true for kun Norge og FTRL_KAP2_2_1", () => {
    const bestemmelse = MKV.Koder.folketrygdloven_kap2_bestemmelser.FTRL_KAP2_2_1;
    expect(tillattMedManglendeSluttDato([MKV.Koder.landkoder.NO], bestemmelse)).toBe(true);
  });

  it("returnerer false for flere land", () => {
    const bestemmelse = MKV.Koder.folketrygdloven_kap2_bestemmelser.FTRL_KAP2_2_1;
    expect(tillattMedManglendeSluttDato([MKV.Koder.landkoder.NO, "SE"], bestemmelse)).toBe(false);
  });

  it("returnerer false for annen bestemmelse", () => {
    expect(tillattMedManglendeSluttDato([MKV.Koder.landkoder.NO], "ANNEN")).toBe(false);
  });
});

describe("finnAktivFeilmelding", () => {
  it("returnerer INGEN_MEDLEMSKAPSPERIODER for tom liste", () => {
    expect(finnAktivFeilmelding([], "type", "tema", false, "2024-01-01")).toBe("INGEN_MEDLEMSKAPSPERIODER");
  });

  it("returnerer IKKE_STØTTET_I_MELOSYS når alle perioder er avslått", () => {
    const perioder = [lagPeriode({ innvilgelsesResultat: AVSLAATT })];
    expect(finnAktivFeilmelding(perioder, "type", "tema", false, "2024-01-01")).toBe("IKKE_STØTTET_I_MELOSYS");
  });

  it("returnerer undefined for gyldig innvilget periode", () => {
    const perioder = [lagPeriode()];
    expect(finnAktivFeilmelding(perioder, "type", "tema", false, "2024-01-01", "2024-06-01")).toBeUndefined();
  });
});

describe("Feilmelding", () => {
  it("rendrer feilmelding for ingen perioder", () => {
    render(<Feilmelding type="INGEN_MEDLEMSKAPSPERIODER" />);
    expect(screen.getByText(/minst én periode/)).toBeDefined();
  });

  it("rendrer feilmelding for overlapp i innvilgede", () => {
    render(<Feilmelding type="OVERLAPP_I_INNVILGEDE_PERIODER" />);
    expect(screen.getByText(/Innvilgede perioder overlapper/)).toBeDefined();
  });

  it("rendrer IngenFlytMelding for ikke-støttet", () => {
    render(<Feilmelding type="IKKE_STØTTET_I_MELOSYS" />);
    expect(screen.getByText("IngenFlytMelding")).toBeDefined();
  });

  it("rendrer advarsel for familiemedlemmer", () => {
    render(<Feilmelding type="BESTEMMELSE_FOR_FAMILIEMEDLEMMER" />);
    expect(screen.getByText(/forsørgerens vedtak/)).toBeDefined();
  });

  it("returnerer null for ukjent type", () => {
    const { container } = render(<Feilmelding type="UKJENT" />);
    expect(container.innerHTML).toBe("");
  });
});
