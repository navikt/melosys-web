import DialogboksOppfriskBehandling from "./dialogboksOppfrisk";
import { render, screen } from "@testing-library/react";

describe("DialogboksOppfrisk", () => {
  let props = null;

  beforeEach(() => {
    props = {
      oppfrisk: vi.fn(),
      avbryt: vi.fn(),
      lukk: vi.fn(),
      tilForsiden: vi.fn(),
      behandlingOppfriskes: false,
      annenBehandlingOppfriskes: false,
      ariaHideApp: false,
    };
  });

  it("viser en nav modal", () => {
    render(<DialogboksOppfriskBehandling {...props} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("viser ikke oppfrisk knapp når en annen behandling oppfriskes", () => {
    props.annenBehandlingOppfriskes = true;

    render(<DialogboksOppfriskBehandling {...props} />);

    expect(screen.getByRole("heading")).toHaveTextContent("Kan ikke oppdatere registeropplysninger");
    expect(screen.getByRole("button")).toHaveTextContent("Lukk");
    expect(screen.queryByText("Fortsett oppdatering")).not.toBeInTheDocument();
  });

  it("viser forventet heading, oppfrisk og avbryt oppfriskning knapper", () => {
    render(<DialogboksOppfriskBehandling {...props} />);

    expect(screen.getByRole("heading")).toHaveTextContent("Vil du oppdatere registeropplysninger?");
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent("Fortsett oppdatering");
    expect(buttons[1]).toHaveTextContent("Avbryt oppdatering");
  });
});
