import { render } from "@testing-library/react";
import { VurderingAarsavregning } from "./vurderingAarsavregning";

describe("VurderingAarsavregning", () => {
  it("snapshot test", () => {
    const { asFragment } = render(<VurderingAarsavregning />);
    expect(asFragment()).toMatchSnapshot();
  });
});
