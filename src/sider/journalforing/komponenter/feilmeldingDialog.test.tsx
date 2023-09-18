import { ComponentProps } from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import FeilmeldingDialog from "./feilmeldingDialog";

describe("FeilmeldingDialog", () => {
  const props: ComponentProps<typeof FeilmeldingDialog> = {
    avbryt: vi.fn(),
    feilmeldinger: [],
  };

  it("Viser en modal", () => {
    const { getByRole } = renderWithProviders(<FeilmeldingDialog {...props} />);
    expect(getByRole("dialog")).toBeInTheDocument();
  });

  it("Viser en liste over feilmeldinger for feilmeldinger", () => {
    props.feilmeldinger = [
      { tittel: "tittel1", innhold: "innhold1" },
      { tittel: "tittel2", innhold: "innhold2" },
    ];
    renderWithProviders(<FeilmeldingDialog {...props} />);

    expect(screen.getByText("tittel1")).toBeInTheDocument();
    expect(screen.getByText("tittel2")).toBeInTheDocument();
  });
});
