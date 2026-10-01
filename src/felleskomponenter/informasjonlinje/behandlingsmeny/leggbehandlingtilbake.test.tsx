import { vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { navigeringOperations } from "../../../ducks/navigering";
import { MELOSYS_TILDEL_OPPGAVE } from "../../../featuretoggle/toggleNavn";
import { screen } from "@testing-library/react";
import { renderWithProvidersAsync } from "../../../ducks/test-utils/renderWithProviders";
import LeggBehandlingTilbake from "./leggbehandlingtilbake";

vi.mock("../../../ducks/navigering", () => ({
  navigeringOperations: { tilForsiden: vi.fn(() => ({ type: "TEST_NAVIGER" })) },
}));

describe("LeggBehandlingTilbake", () => {
  beforeEach(() => vi.clearAllMocks());

  const initialState = (redigerbart: boolean) => ({
    behandlinger: {
      status: "",
      data: {
        redigerbart,
      },
    },
  });

  it("viser begge valg som knapper om redigerbart", async () => {
    await renderWithProvidersAsync(<LeggBehandlingTilbake />, { preloadedState: initialState(true) });

    const knapper = await screen.findAllByRole("button");
    expect(knapper).toHaveLength(2);
    expect(knapper.at(0)?.textContent).toBe("Til min oppgaveliste");
    expect(knapper.at(1)?.textContent).toBe("Til felles oppgaveliste");
  });

  it("viser bare Til felles oppgaveliste som er en tekst om ikke redigerbart", async () => {
    await renderWithProvidersAsync(<LeggBehandlingTilbake />, { preloadedState: initialState(false) });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Til felles oppgaveliste")).toBeInTheDocument();
  });
  it("navigerer fortsatt til forsiden når toggelen er av", async () => {
    await renderWithProvidersAsync(<LeggBehandlingTilbake />, {
      preloadedState: {
        ...initialState(true),
        featureToggle: { status: "OK", data: { [MELOSYS_TILDEL_OPPGAVE]: false } },
      },
    });
    await userEvent.click(screen.getByRole("button", { name: "Til min oppgaveliste" }));
    expect(navigeringOperations.tilForsiden).toHaveBeenCalledOnce();
  });

  it("åpner tildeling i stedet for å navigere når toggelen er på", async () => {
    await renderWithProvidersAsync(<LeggBehandlingTilbake />, {
      preloadedState: {
        behandlinger: {
          data: { behandlingID: 22, redigerbart: false, kanTildeles: true, tildelingTilgjengelig: true },
        },
        featureToggle: { status: "OK", data: { [MELOSYS_TILDEL_OPPGAVE]: true } },
      },
    });
    expect(screen.getAllByRole("button", { name: "Til min oppgaveliste" })).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: "Til min oppgaveliste" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(navigeringOperations.tilForsiden).not.toHaveBeenCalled();
  });
});
