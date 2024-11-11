import InntektsperioderTabell from "./inntektsperioderTabell";
import { render, screen } from "@testing-library/react";

describe("TrygdeavgiftsperioderTabell", () => {
  it("ikke rendrer tabell dersom undefined", () => {
    render(<InntektsperioderTabell />);
    expect(screen.queryByText(/Trygdeavgift/i)).toBeNull();
    expect(screen.queryByText(/Inntektskilde/i)).toBeNull();
  });

  it("rendrer tabell med data", () => {
    const perioder = [
      {
        fomDato: "2022-01-01",
        tomDato: "2022-12-31",
        type: "Arbeid",
        arbeidsgiversavgiftBetales: true,
        avgiftspliktigInntekt: 50000,
        erMaanedsbelop: true,
      },
    ];
    render(<InntektsperioderTabell perioder={perioder} />);
    expect(screen.getByText("Inntekt")).toBeInTheDocument();
    expect(screen.getByText("Inntektskilde")).toBeInTheDocument();
  });

  it("rendrer tabell med flere perioder", () => {
    const perioder = [
      {
        fomDato: "2022-01-01",
        tomDato: "2022-12-31",
        type: "Arbeid",
        arbeidsgiversavgiftBetales: true,
        avgiftspliktigInntekt: 50000,
        erMaanedsbelop: true,
      },
      {
        fomDato: "2022-01-01",
        tomDato: "2022-12-31",
        type: "Pensjon",
        arbeidsgiversavgiftBetales: false,
        avgiftspliktigInntekt: 4000,
        erMaanedsbelop: true,
      },
    ];
    render(<InntektsperioderTabell perioder={perioder} />);
    const rows = screen.getAllByRole("row");
    expect(rows.length - 1).toBe(perioder.length); // -1 for header
  });

  it("formaterer og viser riktig fom og tom datoer", () => {
    const perioder = [
      {
        fomDato: "2022-01-01",
        tomDato: "2022-12-31",
        type: "Arbeid",
        arbeidsgiversavgiftBetales: true,
        avgiftspliktigInntekt: 50000,
        erMaanedsbelop: true,
      },
    ];
    render(<InntektsperioderTabell perioder={perioder} />);
    expect(screen.getByText("01.01.2022 - 31.12.2022")).toBeInTheDocument();
  });
});
