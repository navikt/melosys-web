import { render } from "@testing-library/react";
import { VurderingAarsavregning } from "./vurderingAarsavregning";

describe("VurderingAarsavregning", () => {
  it("renders correctly", () => {
    const { asFragment } = render(<VurderingAarsavregning />);
    expect(asFragment()).toMatchSnapshot();
  });
});
