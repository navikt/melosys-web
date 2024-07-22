import { VurderingAarsavregning } from "./vurderingAarsavregning";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import * as uuid from "uuid";

vi.mock("uuid");

describe("VurderingAarsavregning", () => {
  it("snapshot test", () => {
    const { asFragment } = renderWithProviders(<VurderingAarsavregning />);
    expect(asFragment()).toMatchSnapshot();
  });
});
