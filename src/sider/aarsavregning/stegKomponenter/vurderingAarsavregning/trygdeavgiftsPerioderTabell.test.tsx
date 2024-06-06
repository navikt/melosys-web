import TrygdeavgiftsperioderTabell from "./trygdeavgiftsperioderTabell";
import { render, screen } from "@testing-library/react";

describe("TrygdeavgiftsperioderTabell", () => {
  it("render tom tabell", () => {
    render(<TrygdeavgiftsperioderTabell perioder={[]} />);
  });

  it("Rendrer tabell med data", () => {
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
});
