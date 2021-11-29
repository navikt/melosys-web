import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { shallow } from "enzyme";

import LeggBehandlingTilbake from "./leggbehandlingtilbake";
import Handling from "./handling";

const mockedProps = mock<ComponentProps<typeof LeggBehandlingTilbake>>();

describe("LeggBehandlingTilbake", () => {
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("viser begge valg om redigerbart", () => {
    props.redigerbart = true;
    const leggBehandlingTilbake = shallow(<LeggBehandlingTilbake {...props} />);
    const handlinger = leggBehandlingTilbake.find(Handling);

    expect(handlinger).toHaveLength(2);
    expect(handlinger.at(0).props().tekst).toBe("Til min oppgaveliste");
    expect(handlinger.at(1).props().tekst).toBe("Til felles oppgaveliste");
    expect(handlinger.at(1).props().disabled).toBeFalsy();
  });

  it("viser bare tilFellesOppgaveListe som er disabled om ikke redigerbart", () => {
    props.redigerbart = false;
    const leggBehandlingTilbake = shallow(<LeggBehandlingTilbake {...props} />);
    const handlinger = leggBehandlingTilbake.find(Handling);

    expect(handlinger).toHaveLength(1);
    expect(handlinger.props().tekst).toBe("Til felles oppgaveliste");
    expect(handlinger.props().disabled).toBeTruthy();
  });
});
