import { screen } from "@testing-library/react";
import AvslaattPgaManglendeOpplysninger from "./avslaattPgaManglendeOpplysninger";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";

describe("AvslaattPgaManglendeOpplysninger", () => {
  it("Viser AvslaattPgaManglendeOpplysninger", () => {
    renderWithProviders(<AvslaattPgaManglendeOpplysninger />);

    expect(screen.getByText("Søknaden er avslått")).toBeInTheDocument();
  });
});
