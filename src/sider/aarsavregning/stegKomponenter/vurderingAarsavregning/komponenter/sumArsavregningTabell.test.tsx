import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

    expect(screen.getByText("Tidligere beregnet trygdeavgift fra Melosys")).toBeInTheDocument();

    rerender(<SumArsavregningTabell harGrunnlagIMelosys={false} />);

    expect(screen.queryByText("Tidligere beregnet trygdeavgift fra Melosys")).not.toBeInTheDocument();
  });

  it("shows Avgiftssystem row with correct label when value is provided", () => {
    const { rerender } = render(
      <SumArsavregningTabell harGrunnlagIMelosys={false} tidligereTrygdeavgiftAvgiftssystem={8000} />,
    );

    expect(screen.getByText("Innbetalt fra Avgiftssystemet")).toBeInTheDocument();
    expect(screen.getByText("8 000 kr")).toBeInTheDocument();

    rerender(<SumArsavregningTabell harGrunnlagIMelosys={false} />);

    expect(screen.queryByText("Innbetalt fra Avgiftssystemet")).not.toBeInTheDocument();
  });

  it("calculates and displays difference correctly", () => {
    render(
      <SumArsavregningTabell
        nyTrygdeavgift={50000}
        tidligereTrygdeavgift={20000}
        tidligereTrygdeavgiftAvgiftssystem={10000}
        harGrunnlagIMelosys={true}
      />,
    );

    expect(screen.getByText("50 000 kr")).toBeInTheDocument();
    expect(screen.getAllByText("20 000 kr")).toHaveLength(2);
    expect(screen.getByText("10 000 kr")).toBeInTheDocument();
  });

  it("handles negative difference with unicode minus", () => {
    render(<SumArsavregningTabell nyTrygdeavgift={10000} tidligereTrygdeavgift={15000} harGrunnlagIMelosys={true} />);

    // 10000 - 15000 = -5000
    expect(screen.getByText("−5 000 kr")).toBeInTheDocument();
  });

  it("renders correctly with all possible data", () => {
    const { container } = render(
      <SumArsavregningTabell
        nyTrygdeavgift={50000}
        tidligereTrygdeavgift={20000}
        tidligereTrygdeavgiftAvgiftssystem={10000}
        harGrunnlagIMelosys={true}
      />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
