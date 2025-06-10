import DialogboksOppfriskBehandling from "./dialogboksOppfrisk";
import { render, screen } from "@testing-library/react";
import { FellesHandlersContext } from "../../../contexts";

describe("DialogboksOppfrisk", () => {
  let props = null;

  beforeEach(() => {
    props = {
      oppfrisk: vi.fn(),
      avbryt: vi.fn(),
      lukk: vi.fn(),
      tilForsiden: vi.fn(),
      ariaHideApp: false,
      bekreftetFraStart: false,
    };
  });

  it("viser en dialog", () => {
    render(<DialogboksOppfriskBehandling {...props} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("viser ikke oppfrisk knapp når en annen behandling oppfriskes", () => {
    const context = { annenBehandlingOppfriskes: true };
    render(
      <FellesHandlersContext.Provider value={context}>
        <DialogboksOppfriskBehandling {...props} />
      </FellesHandlersContext.Provider>,
    );

    expect(screen.getByRole("heading", { name: "Kan ikke oppdatere registeropplysninger" })).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("Lukk");
    expect(screen.queryByText("Fortsett oppdatering")).not.toBeInTheDocument();
  });

  it("starter med oppfriskning med en gang når bekreftetFraStart er true", () => {
    props.bekreftetFraStart = true;

    render(<DialogboksOppfriskBehandling {...props} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("starter med oppfriskning med en gang når behandlingOppfriskes er true", () => {
    const context = { behandlingOppfriskes: true };
    render(
      <FellesHandlersContext.Provider value={context}>
        <DialogboksOppfriskBehandling {...props} />
      </FellesHandlersContext.Provider>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("viser forventet heading, oppfrisk og avbryt oppfriskning knapper", () => {
    render(<DialogboksOppfriskBehandling {...props} />);

    expect(screen.getByRole("heading", { name: "Vil du oppdatere registeropplysninger?" })).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent("Fortsett oppdatering");
    expect(buttons[1]).toHaveTextContent("Avbryt oppdatering");
  });
});
