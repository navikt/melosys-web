import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LeggBehandlingTilbake from "./leggbehandlingtilbake";

const mockedProps = mock<ComponentProps<typeof LeggBehandlingTilbake>>();

describe("LeggBehandlingTilbake", () => {
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("viser begge valg som knapper om redigerbart", async () => {
    props.redigerbart = true;
    render(<LeggBehandlingTilbake {...props} />);

    expect(screen.queryAllByRole("button")).toHaveLength(1);

    const user = userEvent.setup();
    await user.click(screen.getByText("Legg behandling tilbake"));

    const knapper = await screen.findAllByRole("button");
    expect(knapper).toHaveLength(3);
    expect(knapper.at(1)?.textContent).toBe("Til min oppgaveliste");
    expect(knapper.at(2)?.textContent).toBe("Til felles oppgaveliste");
  });

  it("viser bare Til felles oppgaveliste som er en tekst om ikke redigerbart", async () => {
    props.redigerbart = false;
    render(<LeggBehandlingTilbake {...props} />);

    expect(screen.queryAllByRole("button")).toHaveLength(1);

    const user = userEvent.setup();
    await user.click(screen.getByText("Legg behandling tilbake"));

    const knapper = await screen.findAllByRole("button");
    expect(knapper).toHaveLength(1);
    expect(knapper.at(1)?.textContent).not.toBe("Til felles oppgaveliste");
    expect(screen.getByText("Til felles oppgaveliste"));
  });
});
