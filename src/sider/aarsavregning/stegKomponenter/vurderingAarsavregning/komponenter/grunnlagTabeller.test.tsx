import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GrunnlagTabeller from "./grunnlagTabeller";
import { InntektskildeDto, SkatteforholdDto } from "../../../../../services/modules/trygdeavgift";
import { Avgift } from "../../../../../services/modules/aarsavregning/aarsavregning";

// Mock the child components
vi.mock("./skatteforholdsPerioderTabell", () => ({
  default: vi.fn(() => <div data-testid="skatteforholdsperioder-tabell">Skatteforholdsperioder</div>),
}));

vi.mock("./inntektsperioderTabell", () => ({
  default: vi.fn(() => <div data-testid="inntektsperioder-tabell">Inntektsperioder</div>),
}));

describe("TidligereGrunnlagsoversikt", () => {
  const mockSkatteforholdsperioder: SkatteforholdDto[] = [
    {
      fomDato: "2023-01-01",
      tomDato: "2023-12-31",
      skatteplikttype: "SKATTEPLIKTIG",
    },
  ];

  const mockInntektsperioder: InntektskildeDto[] = [
    {
      fomDato: "2023-01-01",
      tomDato: "2023-12-31",
      type: "ARBEID",
      arbeidsgiversavgiftBetales: true,
      avgiftspliktigInntekt: 500000,
      erMaanedsbelop: false,
    },
  ];

  const mockAvgiftMedGrunnlag: Avgift = {
    totalAvgift: 1000,
    totalInntekt: 50000,
    trygdeavgiftsperioder: [],
  };

  it("does not render when no data is provided", () => {
    const { container } = render(<GrunnlagTabeller />);
    expect(container.firstChild).toBeNull();
  });

  it("renders with skatteforholdsperioder table when data is provided", () => {
    render(<GrunnlagTabeller skatteforholdsperioder={mockSkatteforholdsperioder} />);

    expect(screen.getByTestId("skatteforholdsperioder-tabell")).toBeInTheDocument();
  });

  it("viser inntektsperioder tabell kun når avgift har verdi", () => {
    const { rerender } = render(
      <GrunnlagTabeller
        skatteforholdsperioder={mockSkatteforholdsperioder}
        inntektsperioder={mockInntektsperioder}
        avgift={mockAvgiftMedGrunnlag}
      />,
    );

    expect(screen.getByTestId("skatteforholdsperioder-tabell")).toBeInTheDocument();
    expect(screen.getByTestId("inntektsperioder-tabell")).toBeInTheDocument();

    rerender(
      <GrunnlagTabeller
        skatteforholdsperioder={mockSkatteforholdsperioder}
        inntektsperioder={mockInntektsperioder}
        avgift={{ totalAvgift: 0, totalInntekt: 0, trygdeavgiftsperioder: [] }}
      />,
    );

    expect(screen.queryByTestId("inntektsperioder-tabell")).not.toBeInTheDocument();
  });

  it("renders correctly with complete data", () => {
    const { container } = render(
      <GrunnlagTabeller
        skatteforholdsperioder={mockSkatteforholdsperioder}
        inntektsperioder={mockInntektsperioder}
        avgift={mockAvgiftMedGrunnlag}
      />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
