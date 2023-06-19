import React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { lagState } from "../../../ducks/test-utils";
import LeggBehandlingTilbake from "./leggbehandlingtilbake";

describe("LeggBehandlingTilbake", () => {
  const mockStore = configureMockStore();
  const initiateStore = (redigerbart: boolean) =>
    mockStore(
      lagState({
        behandlinger: {
          status: "",
          data: {
            redigerbart,
          },
        },
      })
    );

  it("viser begge valg som knapper om redigerbart", async () => {
    render(
      <Provider store={initiateStore(true)}>
        <LeggBehandlingTilbake />
      </Provider>
    );

    expect(screen.queryAllByRole("button")).toHaveLength(1);

    const user = userEvent.setup();
    await user.click(screen.getByText("Legg behandling tilbake"));

    const knapper = await screen.findAllByRole("button");
    expect(knapper).toHaveLength(3);
    expect(knapper.at(1)?.textContent).toBe("Til min oppgaveliste");
    expect(knapper.at(2)?.textContent).toBe("Til felles oppgaveliste");
  });

  it("viser bare Til felles oppgaveliste som er en tekst om ikke redigerbart", async () => {
    render(
      <Provider store={initiateStore(false)}>
        <LeggBehandlingTilbake />
      </Provider>
    );

    expect(screen.queryAllByRole("button")).toHaveLength(1);

    const user = userEvent.setup();
    await user.click(screen.getByText("Legg behandling tilbake"));

    const knapper = await screen.findAllByRole("button");
    expect(knapper).toHaveLength(1);
    expect(knapper.at(1)?.textContent).not.toBe("Til felles oppgaveliste");
    expect(screen.getByText("Til felles oppgaveliste")).toBeInTheDocument();
  });
});
