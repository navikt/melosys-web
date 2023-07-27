import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Behandlingsmeny } from "./behandlingsmeny";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

describe("Behandlingsmeny", () => {
  it("Får opp både Legg behandling tilbake og Avslutt sak", async () => {
    const state = {
      behandlinger: {
        status: "",
        data: {
          redigerbart: true,
        },
      },
    };
    renderWithProviders(<Behandlingsmeny />, { preloadedState: state });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));

    expect(await screen.findByText("Legg behandling tilbake")).toBeInTheDocument();
    expect(await screen.findByText("Avslutt sak")).toBeInTheDocument();
  });
});
