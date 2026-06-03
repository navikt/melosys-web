import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SumArsavregningTabell } from "./sumArsavregningTabell";
import useFeatureToggle from "../../../../../featuretoggle/useFeatureToggle";

// Mock dependencies
vi.mock("../../../../../featuretoggle/useFeatureToggle", () => ({
  default: vi.fn(),
}));

vi.mock("../../../../../utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../../../utils")>();
  return {
    ...actual,
    formaterTilNorskBelop: vi.fn((amount) => `${amount?.toLocaleString("nb-NO") || "0"}`),
  };
});

describe("SumArsavregningTabell - Toggle Disabled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockReturnValue(false);
  });

  it("viser tabellen med påkrevde overskrifter", () => {
    render(<SumArsavregningTabell harGrunnlagIMelosys={true} />);

    expect(screen.getByText("Endelig beregnet trygdeavgift")).toBeInTheDocument();
    expect(screen.getByText("Differanse")).toBeInTheDocument();
  });

  it("viser Melosys-raden når harGrunnlagIMelosys er true eller tidligereTrygdeavgift er definert", () => {
    const { rerender } = render(<SumArsavregningTabell harGrunnlagIMelosys={true} />);

    expect(screen.getByText("Tidligere beregnet trygdeavgift")).toBeInTheDocument();

    rerender(<SumArsavregningTabell harGrunnlagIMelosys={false} />);
    expect(screen.queryByText("Tidligere beregnet trygdeavgift")).not.toBeInTheDocument();

    rerender(<SumArsavregningTabell harGrunnlagIMelosys={false} tidligereTrygdeavgift={0} />);
    expect(screen.getByText("Tidligere beregnet trygdeavgift")).toBeInTheDocument();
  });

  it("viser raden for inneværende års Avgiftssystem med riktig ledetekst når verdi er oppgitt", () => {
    const { rerender } = render(
      <SumArsavregningTabell harGrunnlagIMelosys={false} tidligereInnbetaltTrygdeavgift={8000} />,
    );
    // Label for current year's input
    const currentRow = screen.getByText("Trygdeavgift fra Avgiftssystemet").closest("tr");
    expect(within(currentRow!).getByText("8 000 kr")).toBeInTheDocument();

    rerender(<SumArsavregningTabell harGrunnlagIMelosys={false} />);

    expect(screen.queryByText("Trygdeavgift fra Avgiftssystemet")).not.toBeInTheDocument();
  });

  it("viser raden for forrige års Avgiftssystem med riktig ledetekst når verdi er oppgitt", () => {
    const { rerender } = render(
      <SumArsavregningTabell harGrunnlagIMelosys={false} tidligereAarsavregningInnbetaltTrygdeavgift={5000} />,
    );
    // Label for previous year's value in a correction scenario
    const previousRow = screen.getByText("Tidligere trygdeavgift fra Avgiftssystemet").closest("tr");
    expect(within(previousRow!).getByText("5 000 kr")).toBeInTheDocument();

    rerender(<SumArsavregningTabell harGrunnlagIMelosys={false} />);

    expect(screen.queryByText("Tidligere trygdeavgift fra Avgiftssystemet")).not.toBeInTheDocument();
  });

  it("beregner og viser differansen riktig uten forrige års avgiftssystem", () => {
    render(
      <SumArsavregningTabell
        nyTrygdeavgift={50000}
        tidligereTrygdeavgift={20000}
        tidligereInnbetaltTrygdeavgift={10000} // Current year input
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

  it("beregner og viser differansen riktig med forrige års avgiftssystem", () => {
    render(
      <SumArsavregningTabell
        nyTrygdeavgift={50000}
        tidligereTrygdeavgift={20000}
        tidligereInnbetaltTrygdeavgift={10000} // Current year input
        tidligereAarsavregningInnbetaltTrygdeavgift={5000} // Previous year value
        harGrunnlagIMelosys={true}
      />,
    );
    // Sum = 50000 - 20000 - 10000 + 5000 = 25000
    const differanseRow = screen.getByText("Differanse").closest("tr");
    expect(within(differanseRow!).getByText("25 000 kr")).toBeInTheDocument();
  });

  it("håndterer negativ differanse med unicode-minus", () => {
    render(<SumArsavregningTabell nyTrygdeavgift={10000} tidligereTrygdeavgift={15000} harGrunnlagIMelosys={true} />);
    // 10000 - 15000 - 0 + 0 = -5000
    const differanseRow = screen.getByText("Differanse").closest("tr");
    expect(within(differanseRow!).getByText("−5 000 kr")).toBeInTheDocument();
  });

  it("rendrer riktig med alle mulige data", () => {
    const { container } = render(
      <SumArsavregningTabell
        nyTrygdeavgift={50000}
        tidligereTrygdeavgift={20000}
        tidligereInnbetaltTrygdeavgift={10000}
        tidligereAarsavregningInnbetaltTrygdeavgift={5000}
        harGrunnlagIMelosys={true}
      />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});

describe("SumArsavregningTabell - Toggle Enabled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockReturnValue(true);
  });

  it("viser Melosys-raden med uendret ledetekst når toggle er aktivert", () => {
    render(<SumArsavregningTabell harGrunnlagIMelosys={true} />);

    expect(screen.getByText("Tidligere beregnet trygdeavgift")).toBeInTheDocument();
    expect(screen.queryByText("Innbetalt trygdeavgift")).not.toBeInTheDocument();
  });

  it("viser raden for inneværende års Avgiftssystem med riktig ledetekst når verdi er oppgitt", () => {
    const { rerender } = render(
      <SumArsavregningTabell harGrunnlagIMelosys={false} tidligereInnbetaltTrygdeavgift={8000} />,
    );
    // Label for current year's input
    const currentRow = screen.getByText("Innbetalt trygdeavgift").closest("tr");
    expect(within(currentRow!).getByText("8 000 kr")).toBeInTheDocument();

    rerender(<SumArsavregningTabell harGrunnlagIMelosys={false} />);

    expect(screen.queryByText("Innbetalt trygdeavgift")).not.toBeInTheDocument();
  });

  it("viser raden for forrige års Avgiftssystem med riktig ledetekst når verdi er oppgitt", () => {
    const { rerender } = render(
      <SumArsavregningTabell harGrunnlagIMelosys={false} tidligereAarsavregningInnbetaltTrygdeavgift={5000} />,
    );
    // Label for previous year's value in a correction scenario
    const previousRow = screen.getByText("Tidligere innbetalt trygdeavgift").closest("tr");
    expect(within(previousRow!).getByText("5 000 kr")).toBeInTheDocument();

    rerender(<SumArsavregningTabell harGrunnlagIMelosys={false} />);

    expect(screen.queryByText("Tidligere innbetalt trygdeavgift")).not.toBeInTheDocument();
  });

  it("beregner og viser differansen riktig uten forrige års avgiftssystem", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    render(
      <SumArsavregningTabell
        nyTrygdeavgift={50000}
        tidligereTrygdeavgift={20000}
        tidligereInnbetaltTrygdeavgift={10000} // Current year input
        harGrunnlagIMelosys={true}
      />,
    );
    // 50000 - 20000 - 10000 = 20000
    expect(screen.getByText("50 000 kr")).toBeInTheDocument();

    // Check value in "Tidligere beregnet trygdeavgift fra Melosys" row
    const melosysRow = screen.getByText("Tidligere beregnet trygdeavgift").closest("tr");
    expect(within(melosysRow!).getByText("20 000 kr")).toBeInTheDocument();

    // Check value in "Trygdeavgift fra Avgiftssystemet" row (label when toggle is off)
    const avgiftssystemRow = screen.getByText("Trygdeavgift fra Avgiftssystemet").closest("tr");
    expect(within(avgiftssystemRow!).getByText("10 000 kr")).toBeInTheDocument();

    // Check value in "Differanse" row
    const differanseRow = screen.getByText("Differanse").closest("tr");
    expect(within(differanseRow!).getByText("20 000 kr")).toBeInTheDocument();
  });
});
