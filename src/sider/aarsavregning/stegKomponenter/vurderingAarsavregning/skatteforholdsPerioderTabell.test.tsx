import SkatteforholdsPerioderTabell from "./skatteforholdsPerioderTabell";
import { render, screen } from "@testing-library/react";

describe("SkatteforholdsPerioderTabell", () => {
  it("renders without crashing", () => {
    render(<SkatteforholdsPerioderTabell perioder={[]} />);
  });

  it("renders table when perioder is not empty", () => {
    const perioder = [{ fom: "2022-01-01", tom: "2022-12-31", skatteplikttype: "true" }];
    render(<SkatteforholdsPerioderTabell perioder={perioder} />);
    expect(screen.getByText(/Skatteforhold/i)).toBeInTheDocument();
    expect(screen.getByText(/Skattepliktig/i)).toBeInTheDocument();
  });
});
