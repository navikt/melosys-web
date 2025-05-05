import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SumArsavregningTabell } from "./sumArsavregningTabell";

describe("SumArsavregningTabell", () => {
  it("renders correctly with only nyTrygdeavgift and harGrunnlagIMelosys=false", () => {
    const { container } = render(<SumArsavregningTabell nyTrygdeavgift={10000} harGrunnlagIMelosys={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders correctly with nyTrygdeavgift and harGrunnlagIMelosys=true (no tidligere values)", () => {
    const { container } = render(<SumArsavregningTabell nyTrygdeavgift={10000} harGrunnlagIMelosys={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders correctly with nyTrygdeavgift, tidligereTrygdeavgift and harGrunnlagIMelosys=true", () => {
    const { container } = render(
      <SumArsavregningTabell nyTrygdeavgift={10000} tidligereTrygdeavgift={2000} harGrunnlagIMelosys={true} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders correctly with nyTrygdeavgift and tidligereTrygdeavgiftAvgiftssystem", () => {
    const { container } = render(
      <SumArsavregningTabell
        nyTrygdeavgift={10000}
        tidligereTrygdeavgiftAvgiftssystem={3000}
        harGrunnlagIMelosys={false}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders correctly with all values positive", () => {
    const { container } = render(
      <SumArsavregningTabell
        nyTrygdeavgift={10000}
        tidligereTrygdeavgift={2000}
        tidligereTrygdeavgiftAvgiftssystem={3000}
        harGrunnlagIMelosys={true}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders correctly with zero values", () => {
    const { container } = render(
      <SumArsavregningTabell
        nyTrygdeavgift={0}
        tidligereTrygdeavgift={0}
        tidligereTrygdeavgiftAvgiftssystem={0}
        harGrunnlagIMelosys={true}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders correctly with undefined values (treated as 0)", () => {
    const { container } = render(<SumArsavregningTabell harGrunnlagIMelosys={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
