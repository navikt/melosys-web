import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { shallow } from "enzyme";

import MKV from "../../../melosyskodeverk";

import { Behandlingsmeny } from "./behandlingsmeny";
import LeggBehandlingTilbake from "./leggbehandlingtilbake";
import AvsluttSak from "./avsluttsak";

const { ARBEID_I_UTLANDET } = MKV.Koder.behandlinger.behandlingstema;
const { NY_VURDERING } = MKV.Koder.behandlinger.behandlingstyper;
const mockedProps = mock<ComponentProps<typeof Behandlingsmeny>>();
const mockedEvent = mock<React.MouseEvent>();

describe("Behandlingsmeny", () => {
  let props = instance(mockedProps);
  const event = instance(mockedEvent);

  beforeEach(() => {
    props = instance(mockedProps);
    props.redigerbart = true;
  });

  it("rendrer LeggBehandlingTilbake og AvsluttSak med riktige props", () => {
    props.behandlingID = "12";
    props.behandlingstema = ARBEID_I_UTLANDET;
    props.behandlingstype = NY_VURDERING;
    const behandlingsmeny = shallow(<Behandlingsmeny {...props} />);

    behandlingsmeny.find(".behandlingsmeny__knapp").props().onClick?.(event);

    const leggBehandlingTilbake = behandlingsmeny.find(LeggBehandlingTilbake);
    expect(leggBehandlingTilbake.exists()).toBeTruthy();
    expect(leggBehandlingTilbake.props().behandlingID).toBe(props.behandlingID);
    expect(leggBehandlingTilbake.props().redigerbart).toBe(props.redigerbart);

    const avsluttSak = behandlingsmeny.find(AvsluttSak);
    expect(avsluttSak.exists()).toBeTruthy();
    expect(avsluttSak.props().behandlingstema).toBe(props.behandlingstema);
    expect(avsluttSak.props().behandlingstype).toBe(props.behandlingstype);
    expect(avsluttSak.props().redigerbart).toBe(props.redigerbart);
  });
});
