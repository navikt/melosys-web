import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import LeggBehandlingTilbake from "./leggbehandlingtilbake";

describe("LeggBehandlingTilbake", () => {
  const initialState = (redigerbart: boolean) => ({
    behandlinger: {
      status: "",
      data: {
        redigerbart,
      },
    },
  });

  it("viser begge valg som knapper om redigerbart", async () => {
    renderWithProviders(<LeggBehandlingTilbake />, { preloadedState: initialState(true) });

    expect(screen.queryAllByRole("button")).toHaveLength(1);

    const user = userEvent.setup();
    await user.click(screen.getByText("Legg behandling tilbake"));

    const knapper = await screen.findAllByRole("button");
    expect(knapper).toHaveLength(3);
    expect(knapper.at(1)?.textContent).toBe("Til min oppgaveliste");
    expect(knapper.at(2)?.textContent).toBe("Til felles oppgaveliste");
  });

  it("viser bare Til felles oppgaveliste som er en tekst om ikke redigerbart", async () => {
    renderWithProviders(<LeggBehandlingTilbake />, { preloadedState: initialState(false) });

    expect(screen.queryAllByRole("button")).toHaveLength(1);

    const user = userEvent.setup();
    await user.click(screen.getByText("Legg behandling tilbake"));

    const knapper = await screen.findAllByRole("button");
    expect(knapper).toHaveLength(1);
    expect(knapper.at(1)?.textContent).not.toBe("Til felles oppgaveliste");
    expect(screen.getByText("Til felles oppgaveliste")).toBeInTheDocument();
  });
});
