import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../utils", () => ({
  dato: {
    vaskOgFormaterDatoerTilIso: (perioder: any[]) => perioder,
    vaskOgFormatterTilISO: (d: string) => d,
    sorterEtterISOFomDato: (a: any, b: any) => a.fomDato.localeCompare(b.fomDato),
    isoStringTilDate: (d: string) => (d ? new Date(d) : null),
  },
}));

vi.mock("../utils", () => ({
  erBrukerSkattepliktigIHelePerioden: () => true,
}));

vi.mock("../../../../../navFrontend", () => ({
  Alert: ({ children, variant }: any) => <div data-variant={variant}>{children}</div>,
}));

import { finnAktivFeilmelding, finnAktivFeilmeldingForMedlemskapsperioder, Feilmelding } from "./valideringsfeil";

describe("finnAktivFeilmeldingForMedlemskapsperioder", () => {
  it("returnerer OVERLAPPENDE_MEDLEMSKAPSPERIODER for overlappende perioder", () => {
    const perioder = [
      { fomDato: "2024-01-01", tomDato: "2024-06-30" },
      { fomDato: "2024-03-01", tomDato: "2024-09-30" },
    ];
    expect(finnAktivFeilmeldingForMedlemskapsperioder(perioder as any)).toBe("OVERLAPPENDE_MEDLEMSKAPSPERIODER");
  });

  it("returnerer HAR_OPPHOLDSPERIODER_MEDLEMSKAPSPERIODER for opphold", () => {
    const perioder = [
      { fomDato: "2024-01-01", tomDato: "2024-03-31" },
      { fomDato: "2024-06-01", tomDato: "2024-09-30" },
    ];
    expect(finnAktivFeilmeldingForMedlemskapsperioder(perioder as any)).toBe(
      "HAR_OPPHOLDSPERIODER_MEDLEMSKAPSPERIODER",
    );
  });

  it("returnerer undefined for én periode", () => {
    const perioder = [{ fomDato: "2024-01-01", tomDato: "2024-12-31" }];
    expect(finnAktivFeilmeldingForMedlemskapsperioder(perioder as any)).toBeUndefined();
  });
});

describe("finnAktivFeilmelding", () => {
  const baseParams = {
    skatteforholdsperioder: [] as any[],
    inntektskilder: [] as any[],
    medlemskapsperiodeFomTom: { fomDato: "2024-01-01", tomDato: "2024-12-31" },
    medlemskapsperioder: [{ fomDato: "2024-01-01", tomDato: "2024-12-31" }] as any[],
    medlemskapstypeErPliktig: true,
  };

  it("returnerer undefined uten skatteforholdsperioder", () => {
    expect(finnAktivFeilmelding(baseParams)).toBeUndefined();
  });

  it("returnerer OVERLAPPENDE_SKATTEFORHOLDSPERIODER", () => {
    expect(
      finnAktivFeilmelding({
        ...baseParams,
        skatteforholdsperioder: [
          { fomDato: "2024-01-01", tomDato: "2024-06-30", skatteplikttype: "A" },
          { fomDato: "2024-03-01", tomDato: "2024-12-31", skatteplikttype: "B" },
        ],
      }),
    ).toBe("OVERLAPPENDE_SKATTEFORHOLDSPERIODER");
  });

  it("returnerer LIKE_SKATTEPLIKTTYPER for like typer", () => {
    expect(
      finnAktivFeilmelding({
        ...baseParams,
        skatteforholdsperioder: [
          { fomDato: "2024-01-01", tomDato: "2024-06-30", skatteplikttype: "A" },
          { fomDato: "2024-07-01", tomDato: "2024-12-31", skatteplikttype: "A" },
        ],
      }),
    ).toBe("LIKE_SKATTEPLIKTTYPER");
  });
});

describe("Feilmelding", () => {
  it("rendrer overlappende medlemskapsperioder", () => {
    render(<Feilmelding type="OVERLAPPENDE_MEDLEMSKAPSPERIODER" />);
    expect(screen.getByText(/kan ikke overlappe/)).toBeDefined();
  });

  it("rendrer skatteforhold dekker ikke", () => {
    render(<Feilmelding type="SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN" />);
    expect(screen.getByText(/dekker ikke hele/)).toBeDefined();
  });

  it("rendrer default tom div", () => {
    const { container } = render(<Feilmelding type="UKJENT" />);
    expect(container.querySelector("div")).toBeDefined();
  });
});
