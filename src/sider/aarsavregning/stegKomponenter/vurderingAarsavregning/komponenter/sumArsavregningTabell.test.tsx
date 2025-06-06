import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SumArsavregningTabell } from "./sumArsavregningTabell";

// Mock dependencies
vi.mock("../../../../../utils", () => ({
  _uuid: vi.fn(() => "mock-uuid"),
  formaterTilNorskBelop: vi.fn((amount) => `${amount?.toLocaleString("nb-NO") || "0"}`),
}));

describe("SumArsavregningTabell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders table with required headers", () => {
    render(<SumArsavregningTabell harGrunnlagIMelosys={true} />);

    expect(screen.getByText("Endelig beregnet trygdeavgift")).toBeInTheDocument();
    expect(screen.getByText("Differanse")).toBeInTheDocument();
  });

  it("shows Melosys row only when harGrunnlagIMelosys is true", () => {
    const { rerender } = render(<SumArsavregningTabell harGrunnlagIMelosys={true} />);

    expect(screen.getByText("Tidligere beregnet trygdeavgift")).toBeInTheDocument();

    rerender(<SumArsavregningTabell harGrunnlagIMelosys={false} />);

    expect(screen.queryByText("Tidligere beregnet trygdeavgift")).not.toBeInTheDocument();
  });

  it("shows current year Avgiftssystem row with correct label when value is provided", () => {
    const { rerender } = render(
      <SumArsavregningTabell harGrunnlagIMelosys={false} tidligereTrygdeavgiftAvgiftssystem={8000} />,
    );
    // Label for current year's input
    const currentRow = screen.getByText("Trygdeavgift fra Avgiftssystemet").closest("tr");
    expect(within(currentRow!).getByText("8 000 kr")).toBeInTheDocument();

    rerender(<SumArsavregningTabell harGrunnlagIMelosys={false} />);

    expect(screen.queryByText("Trygdeavgift fra Avgiftssystemet")).not.toBeInTheDocument();
  });

  it("shows previous year Avgiftssystem row with correct label when value is provided", () => {
    const { rerender } = render(
      <SumArsavregningTabell harGrunnlagIMelosys={false} tidligereAarsavregningTrygdeavgiftFraAvgiftssystem={5000} />,
    );
    // Label for previous year's value in a correction scenario
    const previousRow = screen.getByText("Tidligere trygdeavgift fra Avgiftssystemet").closest("tr");
    expect(within(previousRow!).getByText("5 000 kr")).toBeInTheDocument();

    rerender(<SumArsavregningTabell harGrunnlagIMelosys={false} />);

    expect(screen.queryByText("Tidligere trygdeavgift fra Avgiftssystemet")).not.toBeInTheDocument();
  });

  it("calculates and displays difference correctly without previous year avgiftssystem", () => {
    render(
      <SumArsavregningTabell
        nyTrygdeavgift={50000}
        tidligereTrygdeavgift={20000}
        tidligereTrygdeavgiftAvgiftssystem={10000} // Current year input
        harGrunnlagIMelosys={true}
      />,
    );
    // 50000 - 20000 - 10000 = 20000
    expect(screen.getByText("50 000 kr")).toBeInTheDocument();

    // Check value in "Tidligere beregnet trygdeavgift fra Melosys" row
    const melosysRow = screen.getByText("Tidligere beregnet trygdeavgift").closest("tr");
    expect(within(melosysRow!).getByText("20 000 kr")).toBeInTheDocument();

    // Check value in "Innbetalt fra Avgiftssystemet" row
    const avgiftssystemRow = screen.getByText("Trygdeavgift fra Avgiftssystemet").closest("tr");
    expect(within(avgiftssystemRow!).getByText("10 000 kr")).toBeInTheDocument();

    // Check value in "Differanse" row
    const differanseRow = screen.getByText("Differanse").closest("tr");
    expect(within(differanseRow!).getByText("20 000 kr")).toBeInTheDocument();
  });

  it("calculates and displays difference correctly WITH previous year avgiftssystem", () => {
    render(
      <SumArsavregningTabell
        nyTrygdeavgift={50000}
        tidligereTrygdeavgift={20000}
        tidligereTrygdeavgiftAvgiftssystem={10000} // Current year input
        tidligereAarsavregningTrygdeavgiftFraAvgiftssystem={5000} // Previous year value
        harGrunnlagIMelosys={true}
      />,
    );
    // Sum = 50000 - 20000 - 10000 + 5000 = 25000
    const differanseRow = screen.getByText("Differanse").closest("tr");
    expect(within(differanseRow!).getByText("25 000 kr")).toBeInTheDocument();
  });

  it("handles negative difference with unicode minus", () => {
    render(<SumArsavregningTabell nyTrygdeavgift={10000} tidligereTrygdeavgift={15000} harGrunnlagIMelosys={true} />);
    // 10000 - 15000 - 0 + 0 = -5000
    const differanseRow = screen.getByText("Differanse").closest("tr");
    expect(within(differanseRow!).getByText("−5 000 kr")).toBeInTheDocument();
  });

  it("renders correctly with all possible data", () => {
    const { container } = render(
      <SumArsavregningTabell
        nyTrygdeavgift={50000}
        tidligereTrygdeavgift={20000}
        tidligereTrygdeavgiftAvgiftssystem={10000}
        tidligereAarsavregningTrygdeavgiftFraAvgiftssystem={5000}
        harGrunnlagIMelosys={true}
      />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
