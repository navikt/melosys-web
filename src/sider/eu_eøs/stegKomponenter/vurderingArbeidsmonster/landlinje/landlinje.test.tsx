import LandLinje from "./landlinje";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";
import { screen } from "@testing-library/react";

describe("LandLinje", () => {
  const props = {
    land: "DK",
    checkbox: {
      checked: true,
      onCheck: vi.fn(),
      redigerbart: true,
      value: "Testvalue",
    },
  };

  it("viser land og checkbox", () => {
    renderWithProviders(<LandLinje {...props} />);
    expect(screen.getByText("DK")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });
});
