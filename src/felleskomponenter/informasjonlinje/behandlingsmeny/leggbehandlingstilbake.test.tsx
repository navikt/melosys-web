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

    const knapper = await screen.findAllByRole("button");
    expect(knapper).toHaveLength(2);
    expect(knapper.at(0)?.textContent).toBe("Til min oppgaveliste");
    expect(knapper.at(1)?.textContent).toBe("Til felles oppgaveliste");
  });

  it("viser bare Til felles oppgaveliste som er en tekst om ikke redigerbart", async () => {
    renderWithProviders(<LeggBehandlingTilbake />, { preloadedState: initialState(false) });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Til felles oppgaveliste")).toBeInTheDocument();
  });
});
