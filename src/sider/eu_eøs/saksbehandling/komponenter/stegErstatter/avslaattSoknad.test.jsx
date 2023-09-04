import { screen } from "@testing-library/react";
import AvslaattSoknad from "./avslaattSoknad";
import { renderWithProviders } from "~/ducks/test-utils/renderWithProviders";

describe("AvslattSoknad", () => {
  it("Viser AvslaattSoknad", () => {
    renderWithProviders(<AvslaattSoknad />);

    expect(screen.getByText("Søknaden er avslått")).toBeInTheDocument();
  });
});
