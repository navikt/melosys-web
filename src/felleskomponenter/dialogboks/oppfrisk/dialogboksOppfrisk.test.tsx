import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import DialogboksOppfriskBehandling from "./dialogboksOppfrisk";
import { FellesHandlersContext } from "../../../contexts";

describe("DialogboksOppfrisk", () => {
  let props: any;

  beforeEach(() => {
    props = {
      oppfrisk: vi.fn().mockResolvedValue(undefined),
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

  it("starter med oppfriskning med en gang når bekreftetFraStart er true", async () => {
    props.bekreftetFraStart = true;

    render(<DialogboksOppfriskBehandling {...props} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Registeropplysningene er oppdatert")).toBeInTheDocument();
    });
  });

  it("starter med oppfriskning med en gang når behandlingOppfriskes er true", async () => {
    const context = { behandlingOppfriskes: true };
    render(
      <FellesHandlersContext.Provider value={context}>
        <DialogboksOppfriskBehandling {...props} />
      </FellesHandlersContext.Provider>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Registeropplysningene er oppdatert")).toBeInTheDocument();
    });
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
