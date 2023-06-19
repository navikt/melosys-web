import React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { lagState } from "../../../ducks/test-utils";
import { Behandlingsmeny } from "./behandlingsmeny";

describe("Behandlingsmeny", () => {
  it("Får opp både Legg behandling tilbake og Avslutt sak", async () => {
    const mockStore = configureMockStore();
    const store = mockStore(
      lagState({
        behandlinger: {
          status: "",
          data: {
            redigerbart: true,
          },
        },
      })
    );
    render(
      <Provider store={store}>
        <Behandlingsmeny />
      </Provider>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));

    expect(await screen.findByText("Legg behandling tilbake")).toBeInTheDocument();
    expect(await screen.findByText("Avslutt sak")).toBeInTheDocument();
  });
});
