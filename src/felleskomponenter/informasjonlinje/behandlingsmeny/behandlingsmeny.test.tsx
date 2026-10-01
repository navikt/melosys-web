import { screen } from "@testing-library/react";
import { MELOSYS_TILDEL_OPPGAVE } from "../../../featuretoggle/toggleNavn";
import userEvent from "@testing-library/user-event";
import Behandlingsmeny from "./behandlingsmeny";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

describe("Behandlingsmeny", () => {
  const state = {
    behandlinger: {
      status: "",
      data: {
        redigerbart: true,
      },
    },
  };

  it("Får opp både Legg behandling tilbake og Avslutt sak", async () => {
    const { getByRole, findByText } = renderWithProviders(<Behandlingsmeny />, { preloadedState: state });

    const user = userEvent.setup();
    await user.click(getByRole("button"));

    expect(await findByText("Legg behandling tilbake")).toBeInTheDocument();
    expect(await findByText("Avslutt behandling")).toBeInTheDocument();
  });

  it("snapshot test", async () => {
    const { container, getByRole } = renderWithProviders(<Behandlingsmeny />, { preloadedState: state });

    const user = userEvent.setup();
    await user.click(getByRole("button"));

    expect(container).toMatchSnapshot();
  });
  it("viser tildeling under Flytt behandling med samme stil som øvrige handlinger", async () => {
    renderWithProviders(<Behandlingsmeny />, {
      preloadedState: {
        featureToggle: { status: "OK", data: { [MELOSYS_TILDEL_OPPGAVE]: true } },
        behandlinger: {
          data: {
            behandlingID: 22,
            redigerbart: false,
            kanTildeles: true,
            tildelingTilgjengelig: true,
            tilordnetMeg: false,
            tilordnetNavn: "Ola Nordmann",
          },
        },
      },
    });
    const user = userEvent.setup();
    expect(screen.queryByRole("button", { name: "Til min oppgaveliste" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Behandlingsmeny" }));
    expect(screen.queryByRole("button", { name: "Legg behandling tilbake" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Flytt behandling" }));
    const tildel = screen.getByRole("button", { name: "Til min oppgaveliste" });
    expect(screen.getAllByRole("button", { name: "Til min oppgaveliste" })).toHaveLength(1);
    expect(screen.queryByText("Legg behandlingen i mine oppgaver")).not.toBeInTheDocument();
    expect(tildel).toHaveClass("behandlingsmeny__handling");
    expect(tildel.closest(".navds-accordion__content")).toContainElement(screen.getByText("Til felles oppgaveliste"));
    await user.click(tildel);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Ola Nordmann", { selector: "strong" })).toBeInTheDocument();
  });
});
