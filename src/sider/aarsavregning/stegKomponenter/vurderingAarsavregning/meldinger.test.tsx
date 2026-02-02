import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../navFrontend", () => ({
  Alert: ({ children, variant }: any) => <div data-variant={variant}>{children}</div>,
}));

vi.mock("../../../../utils", () => ({
  _isEmpty: (val: any) => !val || val.length === 0,
  dato: {
    formatterDatoTilISO: (d: string) => d,
    sorterEtterISOFomDato: (a: any, b: any) => a.fomDato.localeCompare(b.fomDato),
    erFør: (a: string, b: string) => a < b,
    erEtter: (a: string, b: string) => a > b,
  },
}));

vi.mock("../../../../constants", () => ({
  BOOLSK_STRING: { SANN: "SANN" },
}));

import { finnAktivFeilmelding, feilMeldingBlokkerer, Feilmelding } from "./meldinger";

describe("finnAktivFeilmelding", () => {
  const periode = { fom: "2024-01-01", tom: "2024-12-31" };

  it("returnerer undefined når medlemskapsperioder er undefined", () => {
    expect(finnAktivFeilmelding([], [], undefined)).toBeUndefined();
  });

  it("returnerer undefined når tom er null", () => {
    expect(finnAktivFeilmelding([], [], [], { fom: "2024-01-01", tom: null } as any)).toBeUndefined();
  });

  it("returnerer skatteforhold-feil når periode er utenfor", () => {
    const skatteforhold = [{ fomDato: "2023-06-01", tomDato: "2024-06-30" }] as any;
    const result = finnAktivFeilmelding([], skatteforhold, [], periode);
    expect(result).toBe("SKATTEFORHOLD UTENFOR MEDLEMSKAPSPERIODE");
  });

  it("returnerer inntektskilde-feil når periode er utenfor", () => {
    const inntektskilder = [{ fomDato: "2024-01-01", tomDato: "2025-06-30" }] as any;
    const result = finnAktivFeilmelding(inntektskilder, [], [], periode);
    expect(result).toBe("INNTEKTSKILDE UTENFOR MEDLEMSKAPSPERIODE");
  });

  it("returnerer bruttoinntekt-advarsel for høy månedsinntekt", () => {
    const inntektskilder = [
      { fomDato: "2024-01-01", tomDato: "2024-12-31", bruttoInntekt: 300000, erMaanedsbelop: "SANN" },
    ] as any;
    const result = finnAktivFeilmelding(inntektskilder, [], [], periode);
    expect(result).toBe("BRUTTOINNTEKT_OVER_250K");
  });

  it("returnerer undefined når alt er ok", () => {
    const inntektskilder = [
      { fomDato: "2024-01-01", tomDato: "2024-12-31", bruttoInntekt: 100000, erMaanedsbelop: "SANN" },
    ] as any;
    expect(finnAktivFeilmelding(inntektskilder, [], [], periode)).toBeUndefined();
  });
});

describe("feilMeldingBlokkerer", () => {
  it("blokkerer for inntektskilde utenfor", () => {
    expect(feilMeldingBlokkerer("INNTEKTSKILDE UTENFOR MEDLEMSKAPSPERIODE")).toBe(true);
  });

  it("blokkerer for skatteforhold utenfor", () => {
    expect(feilMeldingBlokkerer("SKATTEFORHOLD UTENFOR MEDLEMSKAPSPERIODE")).toBe(true);
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

  it("rendrer høy månedsinntekt-advarsel", () => {
    render(<Feilmelding type="BRUTTOINNTEKT_OVER_250K" />);
    expect(screen.getByText("Høy månedsinntekt!")).toBeDefined();
  });

  it("rendrer null for ukjent type", () => {
    const { container } = render(<Feilmelding type="UKJENT" />);
    expect(container.innerHTML).toBe("");
  });
});
