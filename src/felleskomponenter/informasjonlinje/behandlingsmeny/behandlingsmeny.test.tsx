import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Behandlingsmeny } from "./behandlingsmeny";
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
    renderWithProviders(<Behandlingsmeny />, { preloadedState: state });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));

    expect(await screen.findByText("Legg behandling tilbake")).toBeInTheDocument();
    expect(await screen.findByText("Avslutt sak")).toBeInTheDocument();
  });

  it("snapshot test", async () => {
    const { container } = renderWithProviders(<Behandlingsmeny />, { preloadedState: state });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));

    expect(container).toMatchSnapshot();
  });
});
