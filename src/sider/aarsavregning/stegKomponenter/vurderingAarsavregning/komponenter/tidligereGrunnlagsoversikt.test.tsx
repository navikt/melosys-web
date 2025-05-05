import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TidligereGrunnlagsoversikt from "./tidligereGrunnlagsoversikt";

vi.mock("./skatteforholdsPerioderTabell", () => ({
  default: () => <div data-testid="mock-skatteforholds-tabell">SkatteforholdsPerioderTabell Mock</div>,
}));
vi.mock("./inntektsperioderTabell", () => ({
  default: () => <div data-testid="mock-inntektsperioder-tabell">InntektsperioderTabell Mock</div>,
}));

describe("TidligereGrunnlagsoversikt", () => {
  it("renders correctly with no data", () => {
    const { container } = render(<TidligereGrunnlagsoversikt />);
    expect(container.firstChild).toBeNull();
  });

  it("renders correctly with only skatteforholdsperioder", () => {
    const mockSkatteforholdsperioder = [{}];
    const { container } = render(
      <TidligereGrunnlagsoversikt skatteforholdsperioder={mockSkatteforholdsperioder as any} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders correctly with skatteforholdsperioder and avgift > 0 (but no inntektsperioder)", () => {
    const mockSkatteforholdsperioder = [{}];
    const mockAvgift = { totalAvgift: 100 };
    const { container } = render(
      <TidligereGrunnlagsoversikt
        skatteforholdsperioder={mockSkatteforholdsperioder as any}
        avgift={mockAvgift as any}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders correctly with skatteforholdsperioder, inntektsperioder and avgift > 0", () => {
    const mockSkatteforholdsperioder = [{}];
    const mockInntektsperioder = [{}];
    const mockAvgift = { totalAvgift: 100 };
    const { container } = render(
      <TidligereGrunnlagsoversikt
        skatteforholdsperioder={mockSkatteforholdsperioder as any}
        inntektsperioder={mockInntektsperioder as any}
        avgift={mockAvgift as any}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders correctly with only inntektsperioder and avgift > 0", () => {
    const mockInntektsperioder = [{}];
    const mockAvgift = { totalAvgift: 100 };
    const { container } = render(
      <TidligereGrunnlagsoversikt inntektsperioder={mockInntektsperioder as any} avgift={mockAvgift as any} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("does not render InntektsperioderTabell if avgift is 0 or undefined", () => {
    const mockSkatteforholdsperioder = [{}];
    const mockInntektsperioder = [{}];
    const mockAvgiftZero = { totalAvgift: 0 };

    const { container: containerZero } = render(
      <TidligereGrunnlagsoversikt
        skatteforholdsperioder={mockSkatteforholdsperioder as any}
        inntektsperioder={mockInntektsperioder as any}
        avgift={mockAvgiftZero as any}
      />,
    );
    expect(containerZero.firstChild).toMatchSnapshot();

    const { container: containerUndefined } = render(
      <TidligereGrunnlagsoversikt
        skatteforholdsperioder={mockSkatteforholdsperioder as any}
        inntektsperioder={mockInntektsperioder as any}
        avgift={undefined}
      />,
    );
    expect(containerUndefined.firstChild).toMatchSnapshot();
  });
});
