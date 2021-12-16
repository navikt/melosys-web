import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { shallow } from "enzyme";

import MKV from "../../../melosyskodeverk";

import { Behandlingsmeny } from "./behandlingsmeny";
import LeggBehandlingTilbake from "./leggbehandlingtilbake";
import AvsluttBehandling from "./avsluttBehandling";
import Handling from "./handling";

const { ARBEID_I_UTLANDET } = MKV.Koder.behandlinger.behandlingstema;
const { AVSLUTTET } = MKV.Koder.behandlinger.behandlingsstatus;
const { NY_VURDERING } = MKV.Koder.behandlinger.behandlingstyper;
const mockedProps = mock<ComponentProps<typeof Behandlingsmeny>>();
const mockedEvent = mock<React.MouseEvent>();

describe("Behandlingsmeny", () => {
  let props = instance(mockedProps);
  const event = instance(mockedEvent);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("rendrer LeggBehandlingTilbake og AvsluttBehandling med riktige props", () => {
    props.behandlingID = "12";
    props.behandlingstema = ARBEID_I_UTLANDET;
    props.behandlingsstatus = AVSLUTTET;
    props.behandlingstype = NY_VURDERING;
    props.redigerbart = true;
    const behandlingsmeny = shallow(<Behandlingsmeny {...props} />);

    behandlingsmeny.find(".behandlingsmeny__knapp").props().onClick?.(event);

    const leggBehandlingTilbake = behandlingsmeny.find(LeggBehandlingTilbake);
    expect(leggBehandlingTilbake.exists()).toBeTruthy();
    expect(leggBehandlingTilbake.props().behandlingID).toBe(props.behandlingID);
    expect(leggBehandlingTilbake.props().redigerbart).toBe(props.redigerbart);

    const avsluttBehandling = behandlingsmeny.find(AvsluttBehandling);
    expect(avsluttBehandling.exists()).toBeTruthy();
    expect(avsluttBehandling.props().behandlingstema).toBe(props.behandlingstema);
    expect(avsluttBehandling.props().behandlingstype).toBe(props.behandlingstype);
    expect(avsluttBehandling.props().redigerbart).toBe(props.redigerbart);

    const menyHandlinger = behandlingsmeny.find(".behandlingsmeny__meny__handlinger").find(Handling);
    expect(menyHandlinger).toHaveLength(2);
    expect(menyHandlinger.at(0).props().tekst).toBe("Vis saksoversikt");
    expect(menyHandlinger.at(1).props().tekst).toBe("Vurder saken på nytt");
  });
});
