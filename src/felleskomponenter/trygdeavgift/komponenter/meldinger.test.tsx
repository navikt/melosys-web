import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../melosyskodeverk";

vi.mock("../../../navFrontend", () => ({
  Alert: ({ children, variant }: any) => <div data-variant={variant}>{children}</div>,
}));

vi.mock("../../../utils", () => ({
  _isEmpty: (val: any) => !val || val.length === 0,
  dato: {
    formatterDatoTilISO: (d: string) => d,
    formatterDatoTilNorsk: (d: string) => d,
    sorterEtterISOFomDato: (a: any, b: any) => a.fomDato.localeCompare(b.fomDato),
    erFør: (a: string, b: string) => a < b,
    erEtter: (a: string, b: string) => a > b,
    perioderOverlapper: (fom1: string, tom1: string, fom2: string, tom2: string) => fom1 <= tom2 && fom2 <= tom1,
  },
}));

import {
  finnAktivFeilmelding,
  finnAktivFeilmeldingEøsPensjonist,
  feilMeldingBlokkerer,
  Feilmelding,
} from "./meldinger";

const { SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;
const { PENSJON_UFØRETRYGD, PENSJON_UFØRETRYGD_KILDESKATT } = MKV.Koder.inntektskildetype;
const { INNVILGET } = MKV.Koder.innvilgelsesResultat;
const { FTRL_2_9_FØRSTE_LEDD_B_PENSJON } = MKV.Koder.trygdedekninger;

describe("finnAktivFeilmelding", () => {
  const periode = { fom: "2024-01-01", tom: "2024-12-31" };

  it("returnerer undefined når ingen innvilget periode", () => {
    expect(finnAktivFeilmelding([], [], [])).toBeUndefined();
  });

  it("returnerer undefined når tom er null", () => {
    expect(finnAktivFeilmelding([], [], [], { fom: "2024-01-01", tom: null } as any)).toBeUndefined();
  });

  it("returnerer skatteforhold-feil når periode er utenfor", () => {
    const skatteforhold = [{ fomDato: "2023-06-01", tomDato: "2024-06-30" }] as any;
    expect(finnAktivFeilmelding([], skatteforhold, [], periode)).toBe("SKATTEFORHOLD UTENFOR MEDLEMSKAPSPERIODE");
  });

  it("returnerer inntektskilde-feil når periode er utenfor", () => {
    const inntektskilder = [{ fomDato: "2024-01-01", tomDato: "2025-06-30" }] as any;
    expect(finnAktivFeilmelding(inntektskilder, [], [], periode)).toBe("INNTEKTSKILDE UTENFOR MEDLEMSKAPSPERIODE");
  });

  it("returnerer pensjon-feil for pensjon/uføretrygd i kun-pensjon-periode", () => {
    const inntektskilder = [{ fomDato: "2024-01-01", tomDato: "2024-12-31", kildetype: PENSJON_UFØRETRYGD }] as any;
    const medlemskapsperioder = [
      {
        fomDato: "2024-01-01",
        tomDato: "2024-12-31",
        innvilgelsesResultat: INNVILGET,
        trygdedekning: FTRL_2_9_FØRSTE_LEDD_B_PENSJON,
      },
    ] as any;
    expect(finnAktivFeilmelding(inntektskilder, [], medlemskapsperioder, periode)).toBe(
      "PENSJON_UFORETRYGD_LAGT_TIL_FOR_PENSJON_PERIODE",
    );
  });

  it("returnerer skattepliktig+kildeskatt-feil ved overlapp", () => {
    const inntektskilder = [
      { fomDato: "2024-01-01", tomDato: "2024-12-31", kildetype: PENSJON_UFØRETRYGD_KILDESKATT },
    ] as any;
    const skatteforhold = [{ fomDato: "2024-01-01", tomDato: "2024-12-31", skatteplikttype: SKATTEPLIKTIG }] as any;
    expect(finnAktivFeilmelding(inntektskilder, skatteforhold, [], periode)).toBe(
      "SKATTEPLIKTIG_OG_PENSJON_UFORETRYGD_MED_KILDESKATT",
    );
  });

  it("returnerer bruttoinntekt-advarsel for høy inntekt", () => {
    const inntektskilder = [{ fomDato: "2024-01-01", tomDato: "2024-12-31", bruttoInntekt: 300000 }] as any;
    expect(finnAktivFeilmelding(inntektskilder, [], [], periode)).toBe("BRUTTOINNTEKT_OVER_250K");
  });

  it("returnerer undefined når alt er ok", () => {
    const inntektskilder = [{ fomDato: "2024-01-01", tomDato: "2024-12-31", bruttoInntekt: 100000 }] as any;
    expect(finnAktivFeilmelding(inntektskilder, [], [], periode)).toBeUndefined();
  });
});

describe("finnAktivFeilmeldingEøsPensjonist", () => {
  const periode = { fom: "2024-01-01", tom: "2024-12-31" };

  it("returnerer undefined uten helseutgift-periode", () => {
    expect(finnAktivFeilmeldingEøsPensjonist([], [])).toBeUndefined();
  });

  it("returnerer skatteforhold-feil for helseutgift-perioder", () => {
    const skatteforhold = [{ fomDato: "2023-06-01", tomDato: "2024-06-30" }] as any;
    expect(finnAktivFeilmeldingEøsPensjonist([], skatteforhold, periode)).toBe(
      "SKATTEFORHOLD UTENFOR HELSEUTGIFT DEKKES PERIODE",
    );
  });

  it("returnerer inntektskilde-feil for helseutgift-perioder", () => {
    const inntektskilder = [{ fomDato: "2024-01-01", tomDato: "2025-06-30" }] as any;
    expect(finnAktivFeilmeldingEøsPensjonist(inntektskilder, [], periode)).toBe(
      "INNTEKTSKILDE UTENFOR HELSEUTGIFT DEKKES PERIODE",
    );
  });
});

describe("feilMeldingBlokkerer", () => {
  it("blokkerer for inntektskilde utenfor", () => {
    expect(feilMeldingBlokkerer("INNTEKTSKILDE UTENFOR MEDLEMSKAPSPERIODE")).toBe(true);
  });

  it("blokkerer for skatteforhold utenfor", () => {
    expect(feilMeldingBlokkerer("SKATTEFORHOLD UTENFOR MEDLEMSKAPSPERIODE")).toBe(true);
  });

  it("blokkerer for skattepliktig+kildeskatt", () => {
    expect(feilMeldingBlokkerer("SKATTEPLIKTIG_OG_PENSJON_UFORETRYGD_MED_KILDESKATT")).toBe(true);
  });

  it("blokkerer for pensjon i pensjon-periode", () => {
    expect(feilMeldingBlokkerer("PENSJON_UFORETRYGD_LAGT_TIL_FOR_PENSJON_PERIODE")).toBe(true);
  });

  it("blokkerer for helseutgift-varianter", () => {
    expect(feilMeldingBlokkerer("INNTEKTSKILDE UTENFOR HELSEUTGIFT DEKKES PERIODE")).toBe(true);
    expect(feilMeldingBlokkerer("SKATTEFORHOLD UTENFOR HELSEUTGIFT DEKKES PERIODE")).toBe(true);
  });

  it("blokkerer ikke for bruttoinntekt", () => {
    expect(feilMeldingBlokkerer("BRUTTOINNTEKT_OVER_250K")).toBe(false);
  });

  it("blokkerer ikke for undefined", () => {
    expect(feilMeldingBlokkerer(undefined)).toBe(false);
  });
});

describe("Feilmelding", () => {
  it("rendrer inntektskilde-feilmelding", () => {
    render(<Feilmelding type="INNTEKTSKILDE UTENFOR MEDLEMSKAPSPERIODE" />);
    expect(screen.getByText(/Inntektskildeperioden/)).toBeDefined();
  });

  it("rendrer skatteforhold-feilmelding", () => {
    render(<Feilmelding type="SKATTEFORHOLD UTENFOR MEDLEMSKAPSPERIODE" />);
    expect(screen.getByText(/Skatteforholdsperioden/)).toBeDefined();
  });

  it("rendrer høy månedsinntekt", () => {
    render(<Feilmelding type="BRUTTOINNTEKT_OVER_250K" />);
    expect(screen.getByText("Høy månedsinntekt!")).toBeDefined();
  });

  it("rendrer kildeskatt-feilmelding", () => {
    render(<Feilmelding type="SKATTEPLIKTIG_OG_PENSJON_UFORETRYGD_MED_KILDESKATT" />);
    expect(screen.getByText(/kildeskatt/)).toBeDefined();
  });

  it("rendrer pensjon-feilmelding", () => {
    render(<Feilmelding type="PENSJON_UFORETRYGD_LAGT_TIL_FOR_PENSJON_PERIODE" />);
    expect(screen.getByText(/helsedel er innvilget/)).toBeDefined();
  });

  it("rendrer null for ukjent type", () => {
    const { container } = render(<Feilmelding type="UKJENT" />);
    expect(container.innerHTML).toBe("");
  });
});
