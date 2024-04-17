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
    const { getByRole, findByText } = renderWithProviders(<Behandlingsmeny />, { preloadedState: state });

    const user = userEvent.setup();
    await user.click(getByRole("button"));

    expect(await findByText("Legg behandling tilbake")).toBeInTheDocument();
    expect(await findByText("Avslutt sak")).toBeInTheDocument();
  });

  // TODO: aria-labelledby generert for ikonet i accordion. Enable i MELOSYS-6534
  it.skip("snapshot test", async () => {
    const { container, getByRole } = renderWithProviders(<Behandlingsmeny />, { preloadedState: state });

    const user = userEvent.setup();
    await user.click(getByRole("button"));

    expect(container).toMatchSnapshot();
  });
});
