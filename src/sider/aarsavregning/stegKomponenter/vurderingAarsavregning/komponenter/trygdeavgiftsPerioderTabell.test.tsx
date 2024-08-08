import TrygdeavgiftsperioderTabell from "./trygdeavgiftsperioderTabell";
import { render, screen } from "@testing-library/react";

describe("TrygdeavgiftsperioderTabell", () => {
  it("ikke rendrer tabell dersom undefined", () => {
    render(<TrygdeavgiftsperioderTabell />);
    expect(screen.queryByText(/Trygdeavgift/i)).toBeNull();
    expect(screen.queryByText(/Inntektskilde/i)).toBeNull();
  });

  it("rendrer tabell med data", () => {
    const perioder = [
      {
        fom: "2022-01-01",
        tom: "2022-12-31",
        inntektskildetype: "Arbeid",
        arbeidsgiversavgiftBetales: true,
        inntektPerMd: 5000,
        avgiftssats: 8.2,
        avgiftPerMd: 410,
      },
    ];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} />);
    expect(screen.getByText(/Trygdeavgift/i)).toBeInTheDocument();
    expect(screen.getByText(/Inntektskilde/i)).toBeInTheDocument();
  });

  it("rendrer tabell med flere perioder", () => {
    const perioder = [
      {
        fom: "2022-01-01",
        tom: "2022-12-31",
        inntektskildetype: "Arbeid",
        arbeidsgiversavgiftBetales: true,
        inntektPerMd: 5000,
        avgiftssats: 8.2,
        avgiftPerMd: 410,
      },
      {
        fom: "2023-01-01",
        tom: "2023-12-31",
        inntektskildetype: "Pensjon",
        arbeidsgiversavgiftBetales: false,
        inntektPerMd: 4000,
        avgiftssats: 5.1,
        avgiftPerMd: 204,
      },
    ];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} />);
    const rows = screen.getAllByRole("row");
    expect(rows.length - 1).toBe(perioder.length); // -1 for header
  });

  it("formaterer og viser riktig fom og tom datoer", () => {
    const perioder = [
      {
        fom: "2022-01-01",
        tom: "2022-12-31",
        inntektskildetype: "Arbeid",
        arbeidsgiversavgiftBetales: true,
        inntektPerMd: 5000,
        avgiftssats: 8.2,
        avgiftPerMd: 410,
      },
    ];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} />);
    expect(screen.getByText("01.01.2022 - 31.12.2022")).toBeInTheDocument();
  });
});
