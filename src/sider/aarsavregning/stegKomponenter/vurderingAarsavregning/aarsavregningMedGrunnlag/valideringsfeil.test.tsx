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

import { finnAktivFeilmelding, Feilmelding } from "./valideringsfeil";

describe("finnAktivFeilmelding", () => {
  const baseParams = {
    skatteforholdsperioder: [] as any[],
    inntektskilder: [] as any[],
    medlemskapsperiodeFomTom: { fomDato: "2024-01-01", tomDato: "2024-12-31" },
    medlemskapstypeErPliktig: true,
  };

  it("returnerer undefined uten skatteforholdsperioder", () => {
    expect(finnAktivFeilmelding(baseParams)).toBeUndefined();
  });

  it("returnerer OVERLAPPENDE_SKATTEFORHOLDSPERIODER for overlapp", () => {
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

  it("returnerer HAR_OPPHOLDSPERIODER_SKATTEFORHOLD for opphold", () => {
    expect(
      finnAktivFeilmelding({
        ...baseParams,
        skatteforholdsperioder: [
          { fomDato: "2024-01-01", tomDato: "2024-03-31", skatteplikttype: "A" },
          { fomDato: "2024-07-01", tomDato: "2024-12-31", skatteplikttype: "B" },
        ],
      }),
    ).toBe("HAR_OPPHOLDSPERIODER_SKATTEFORHOLD");
  });
});

describe("Feilmelding", () => {
  it("rendrer overlappende skatteforholdsperioder", () => {
    render(<Feilmelding type="OVERLAPPENDE_SKATTEFORHOLDSPERIODER" />);
    expect(screen.getByText(/kan ikke overlappe/)).toBeDefined();
  });

  it("rendrer like skatteplikttyper", () => {
    render(<Feilmelding type="LIKE_SKATTEPLIKTTYPER" />);
    expect(screen.getByText(/samme svar/)).toBeDefined();
  });

  it("rendrer oppholdsperioder skatteforhold", () => {
    render(<Feilmelding type="HAR_OPPHOLDSPERIODER_SKATTEFORHOLD" />);
    expect(screen.getByText(/oppholdsperioder/)).toBeDefined();
  });

  it("rendrer skatteforhold dekker ikke for medlemskapsperiode (default)", () => {
    render(<Feilmelding type="SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN" />);
    expect(screen.getByText(/hele medlemskapsperioden\(e\)/)).toBeDefined();
  });

  it("rendrer skatteforhold dekker ikke for helseutgiftdekkesperiode", () => {
    render(<Feilmelding type="SKATTEFORHOLD_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN" erHelseutgiftDekkesPeriode={true} />);
    expect(screen.getByText(/hele perioden Norge dekker helseutgifter/)).toBeDefined();
  });

  it("rendrer inntektskilder dekker ikke for medlemskapsperiode (default)", () => {
    render(<Feilmelding type="INNTEKTSKILDER_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN" />);
    expect(screen.getByText(/hele medlemskapsperioden\(e\)/)).toBeDefined();
  });

  it("rendrer inntektskilder dekker ikke for helseutgiftdekkesperiode", () => {
    render(
      <Feilmelding type="INNTEKTSKILDER_DEKKER_IKKE_HELE_MEDLEMSKAPSPERIODEN" erHelseutgiftDekkesPeriode={true} />,
    );
    expect(screen.getByText(/hele perioden Norge dekker helseutgifter/)).toBeDefined();
  });

  it("rendrer default tom div", () => {
    const { container } = render(<Feilmelding type="UKJENT" />);
    expect(container.querySelector("div")).toBeDefined();
  });
});
