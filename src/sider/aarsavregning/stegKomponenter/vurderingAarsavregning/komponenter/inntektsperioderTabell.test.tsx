import InntektsperioderTabell from "./inntektsperioderTabell";
import { render, screen } from "@testing-library/react";

describe("TrygdeavgiftsperioderTabell", () => {
  it("rendre tabell med dasher som verdier for kolonner på forste rad", () => {
    render(<InntektsperioderTabell />);

    const tdElements = screen.getAllByRole("cell");

    expect(tdElements.length).toBeGreaterThan(0);
    tdElements.forEach((td) => {
      expect(td).toHaveTextContent("-");
      expect(td.innerHTML.trim()).toBe("-");
    });
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
    expect(screen.getByText("Inntektsperiode")).toBeInTheDocument();
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

  it("sorterer perioder i stigende rekkefølge etter fomDato", () => {
    const perioder = [
      {
        fomDato: "2023-01-01",
        tomDato: "2023-12-31",
        type: "Arbeid",
        arbeidsgiversavgiftBetales: true,
        avgiftspliktigInntekt: 50000,
        erMaanedsbelop: true,
      },
      {
        fomDato: "2021-01-01",
        tomDato: "2021-12-31",
        type: "Arbeid",
        arbeidsgiversavgiftBetales: true,
        avgiftspliktigInntekt: 50000,
        erMaanedsbelop: true,
      },
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
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("01.01.2021");
    expect(rows[2]).toHaveTextContent("01.01.2022");
    expect(rows[3]).toHaveTextContent("01.01.2023");
  });
});
