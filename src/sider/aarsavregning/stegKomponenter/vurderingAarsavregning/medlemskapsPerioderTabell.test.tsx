import MedlemskapsPerioderTabell from "./medlemskapsPerioderTabell";
import { render, screen } from "@testing-library/react";

describe("MedlemskapsPerioderTabell", () => {
  it("render tabell uten data", () => {
    render(<MedlemskapsPerioderTabell perioder={[]} />);
  });

  it("Rendrer tabell med data", () => {
    const perioder = [{ fom: "2022-01-01", tom: "2022-12-31", trygdedekning: "Full" }];
    render(<MedlemskapsPerioderTabell perioder={perioder} />);
    expect(screen.getByText(/Medlemskap/i)).toBeInTheDocument();
    expect(screen.getByText(/Dekning/i)).toBeInTheDocument();
  });
});
