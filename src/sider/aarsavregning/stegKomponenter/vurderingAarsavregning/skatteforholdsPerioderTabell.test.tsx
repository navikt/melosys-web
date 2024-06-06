import SkatteforholdsPerioderTabell from "./skatteforholdsPerioderTabell";
import { render, screen } from "@testing-library/react";

describe("SkatteforholdsPerioderTabell", () => {
  it("renders render tabell uten data", () => {
    render(<SkatteforholdsPerioderTabell perioder={[]} />);
  });

  it("Rendrer tabell med data", () => {
    const perioder = [{ fom: "2022-01-01", tom: "2022-12-31", skatteplikttype: "true" }];
    render(<SkatteforholdsPerioderTabell perioder={perioder} />);
    expect(screen.getByText(/Skatteforhold/i)).toBeInTheDocument();
    expect(screen.getByText(/Skattepliktig/i)).toBeInTheDocument();
  });
});
