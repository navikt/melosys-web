import SkatteforholdsPerioderTabell from "./skatteforholdsPerioderTabell";
import { render, screen } from "@testing-library/react";

describe("SkatteforholdsPerioderTabell", () => {
  it("ikke rendrer tabell når perioder prop er undefined", () => {
    render(<SkatteforholdsPerioderTabell />);
    expect(screen.queryByText(/Skatteforhold/i)).toBeNull();
    expect(screen.queryByText(/Skattepliktig/i)).toBeNull();
  });

  it("rendrer tabell med data", () => {
    const perioder = [{ fom: "2022-01-01", tom: "2022-12-31", skatteplikttype: "true" }];
    render(<SkatteforholdsPerioderTabell perioder={perioder} />);
    expect(screen.getByText(/Skatteforhold/i)).toBeInTheDocument();
    expect(screen.getByText(/Skattepliktig/i)).toBeInTheDocument();
  });

  it("rendrer tabell med flere perioder", () => {
    const perioder = [
      { fom: "2022-01-01", tom: "2022-12-31", skatteplikttype: "true" },
      { fom: "2023-01-01", tom: "2023-12-31", skatteplikttype: "false" },
    ];
    render(<SkatteforholdsPerioderTabell perioder={perioder} />);
    const rows = screen.getAllByRole("row");
    expect(rows.length - 1).toBe(perioder.length); // -1 for header
  });

  it("formaterer og viser riktig fom og tom datoer", () => {
    const perioder = [{ fom: "2022-01-01", tom: "2022-12-31", skatteplikttype: "true" }];
    render(<SkatteforholdsPerioderTabell perioder={perioder} />);
    expect(screen.getByText("01.01.2022 - 31.12.2022")).toBeInTheDocument();
  });

  it("viser riktig skatteplikttype verdi", () => {
    const perioder = [{ fom: "2022-01-01", tom: "2022-12-31", skatteplikttype: "true" }];
    render(<SkatteforholdsPerioderTabell perioder={perioder} />);
    expect(screen.getByText("true")).toBeInTheDocument();
  });
});
