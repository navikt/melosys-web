import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Behandlingsmeny } from "./behandlingsmeny";

const mockedProps = mock<ComponentProps<typeof Behandlingsmeny>>();

describe("Behandlingsmeny", () => {
  const props = instance(mockedProps);

  it("Får opp både Legg behandling tilbake og Avslutt sak", async () => {
    props.redigerbart = true;
    render(<Behandlingsmeny {...props} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));

    expect(await screen.findByText("Legg behandling tilbake"));
    expect(await screen.findByText("Avslutt sak"));
  });
});
