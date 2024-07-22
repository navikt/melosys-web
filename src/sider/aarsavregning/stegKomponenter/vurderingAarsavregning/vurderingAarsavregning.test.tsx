import { VurderingAarsavregning } from "./vurderingAarsavregning";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

vi.mock("uuid");

describe("VurderingAarsavregning", () => {
  it("snapshot test", () => {
    const { asFragment } = renderWithProviders(<VurderingAarsavregning />);
    expect(asFragment()).toMatchSnapshot();
  });
});
