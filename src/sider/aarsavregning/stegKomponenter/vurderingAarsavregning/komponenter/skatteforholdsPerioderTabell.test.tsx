import SkatteforholdsPerioderTabell from "./skatteforholdsPerioderTabell";
import { render, screen } from "@testing-library/react";

describe("SkatteforholdsPerioderTabell", () => {
  it("ikke rendrer tabell når perioder prop er undefined", () => {
    render(<SkatteforholdsPerioderTabell />);
    expect(screen.queryByText(/Skatteforhold/i)).toBeNull();
    expect(screen.queryByText(/Skattepliktig/i)).toBeNull();
  });

  it("rendrer tabell med data", () => {
    const perioder = [{ fomDato: "2022-01-01", tomDato: "2022-12-31", skatteplikttype: "SKATTEPLIKTIG" }];
    render(<SkatteforholdsPerioderTabell perioder={perioder} />);
    expect(screen.getByText(/Skatteforhold/i)).toBeInTheDocument();
    expect(screen.getByText(/Skattepliktig/i)).toBeInTheDocument();
  });

  it("rendrer tabell med flere perioder", () => {
    const perioder = [
      { fomDato: "2022-01-01", tomDato: "2022-12-31", skatteplikttype: "SKATTEPLIKTIG" },
      { fomDato: "2023-01-01", tomDato: "2023-12-31", skatteplikttype: "IKKE_SKATTEPLIKTIG" },
    ];
    render(<SkatteforholdsPerioderTabell perioder={perioder} />);
    const rows = screen.getAllByRole("row");
    expect(rows.length - 1).toBe(perioder.length); // -1 for header
  });

  it("formaterer og viser riktig fom og tom datoer", () => {
    const perioder = [{ fomDato: "2022-01-01", tomDato: "2022-12-31", skatteplikttype: "SKATTEPLIKTIG" }];
    render(<SkatteforholdsPerioderTabell perioder={perioder} />);
    expect(screen.getByText("01.01.2022 - 31.12.2022")).toBeInTheDocument();
  });

  it("viser riktig skatteplikttype verdi", () => {
    const perioder = [{ fomDato: "2022-01-01", tomDato: "2022-12-31", skatteplikttype: "SKATTEPLIKTIG" }];
    render(<SkatteforholdsPerioderTabell perioder={perioder} />);
    expect(screen.getByText("Ja")).toBeInTheDocument();
  });

  it("sorterer perioder i stigende rekkefølge etter fomDato", () => {
    const perioder = [
      { fomDato: "2023-01-01", tomDato: "2023-12-31", skatteplikttype: "SKATTEPLIKTIG" },
      { fomDato: "2021-01-01", tomDato: "2021-12-31", skatteplikttype: "SKATTEPLIKTIG" },
      { fomDato: "2022-01-01", tomDato: "2022-12-31", skatteplikttype: "SKATTEPLIKTIG" },
    ];
    render(<SkatteforholdsPerioderTabell perioder={perioder} />);
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("01.01.2021");
    expect(rows[2]).toHaveTextContent("01.01.2022");
    expect(rows[3]).toHaveTextContent("01.01.2023");
  });
});
