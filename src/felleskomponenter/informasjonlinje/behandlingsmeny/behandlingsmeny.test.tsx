import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { shallow } from "enzyme";

import MKV from "../../../melosyskodeverk";

import { Behandlingsmeny } from "./behandlingsmeny";
import LeggBehandlingTilbake from "./leggbehandlingtilbake";
import AvsluttSak from "./avsluttsak";
import Handling from "./handling";

const { ARBEID_I_UTLANDET, REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING, REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE } =
  MKV.Koder.behandlinger.behandlingstema;
const { AVSLUTTET, MIDLERTIDIG_LOVVALGSBESLUTNING, UNDER_BEHANDLING } = MKV.Koder.behandlinger.behandlingsstatus;
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
    props.behandlingsstatus = AVSLUTTET;
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

    const menyHandlinger = behandlingsmeny.find(".behandlingsmeny__meny__handlinger").find(Handling);
    expect(menyHandlinger).toHaveLength(1);
    expect(menyHandlinger.at(0).props().tekst).toBe("Vurder saken på nytt");
  });

  it(`Vurder saken på nytt vises ikke dersom behandlingsstatus er ${UNDER_BEHANDLING}`, () => {
    props.behandlingstema = REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING;
    props.behandlingsstatus = UNDER_BEHANDLING;

    const behandlingsmeny = shallow(<Behandlingsmeny {...props} />);
    behandlingsmeny.find(".behandlingsmeny__knapp").props().onClick?.(event);

    const menyHandlinger = behandlingsmeny.find(".behandlingsmeny__meny__handlinger").find(Handling);
    expect(menyHandlinger).toHaveLength(0);
  });

  it(`Vurder saken på nytt vises dersom behandlingsstatus er ${AVSLUTTET} og behandlingstema er ${REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING}`, () => {
    props.behandlingsstatus = AVSLUTTET;
    props.behandlingstema = REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING;

    const behandlingsmeny = shallow(<Behandlingsmeny {...props} />);
    behandlingsmeny.find(".behandlingsmeny__knapp").props().onClick?.(event);

    const menyHandlinger = behandlingsmeny.find(".behandlingsmeny__meny__handlinger").find(Handling);
    expect(menyHandlinger).toHaveLength(1);
    expect(menyHandlinger.at(0).props().tekst).toBe("Vurder saken på nytt");
  });

  it(`Vurder saken på nytt vises dersom behandlingsstatus er ${MIDLERTIDIG_LOVVALGSBESLUTNING} og behandlingstema er ${REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING}`, () => {
    props.behandlingsstatus = MIDLERTIDIG_LOVVALGSBESLUTNING;
    props.behandlingstema = REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING;

    const behandlingsmeny = shallow(<Behandlingsmeny {...props} />);
    behandlingsmeny.find(".behandlingsmeny__knapp").props().onClick?.(event);

    const menyHandlinger = behandlingsmeny.find(".behandlingsmeny__meny__handlinger").find(Handling);
    expect(menyHandlinger).toHaveLength(1);
    expect(menyHandlinger.at(0).props().tekst).toBe("Vurder saken på nytt");
  });

  it(`Vurder saken på nytt vises dersom behandlingsstatus er ${AVSLUTTET} og behandlingstema er ${REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE}`, () => {
    props.behandlingsstatus = AVSLUTTET;
    props.behandlingstema = REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE;

    const behandlingsmeny = shallow(<Behandlingsmeny {...props} />);
    behandlingsmeny.find(".behandlingsmeny__knapp").props().onClick?.(event);

    const menyHandlinger = behandlingsmeny.find(".behandlingsmeny__meny__handlinger").find(Handling);
    expect(menyHandlinger).toHaveLength(1);
    expect(menyHandlinger.at(0).props().tekst).toBe("Vurder saken på nytt");
  });

  it(`Vurder saken på nytt vises dersom behandlingsstatus er ${MIDLERTIDIG_LOVVALGSBESLUTNING} og behandlingstema er ${REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE}`, () => {
    props.behandlingsstatus = MIDLERTIDIG_LOVVALGSBESLUTNING;
    props.behandlingstema = REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE;

    const behandlingsmeny = shallow(<Behandlingsmeny {...props} />);
    behandlingsmeny.find(".behandlingsmeny__knapp").props().onClick?.(event);

    const menyHandlinger = behandlingsmeny.find(".behandlingsmeny__meny__handlinger").find(Handling);
    expect(menyHandlinger).toHaveLength(1);
    expect(menyHandlinger.at(0).props().tekst).toBe("Vurder saken på nytt");
  });
});
