import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { mount } from "enzyme";

import MKV from "../../../../melosyskodeverk";

import { Behandlingsmeny } from "./behandlingsmeny";
import LeggBehandlingTilbake from "./leggbehandlingtilbake";
import AvsluttSak from "./avsluttsak";
import Handling from "./handling";
import { act } from "react-dom/test-utils";

const { BESLUTNING_LOVVALG_NORGE, ARBEID_I_UTLANDET } = MKV.Koder.behandlinger.behandlingstema;
const { AVSLUTTET } = MKV.Koder.behandlinger.behandlingsstatus;
const mockedProps = mock<ComponentProps<typeof Behandlingsmeny>>();
const mockedEvent = mock<React.MouseEvent>();

describe("Behandlingsmeny", () => {
  let props = instance(mockedProps);
  const event = instance(mockedEvent);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("viser alle linjer", () => {
    props.behandlingstema = ARBEID_I_UTLANDET;
    props.behandlingsstatus = AVSLUTTET;
    props.redigerbart = true;
    const behandlingsmeny = mount(<Behandlingsmeny {...props} />);

    act(() => behandlingsmeny.find(".behandlingsmeny__knapp").props().onClick?.(event));
    behandlingsmeny.update();
    act(() => behandlingsmeny.find(LeggBehandlingTilbake).find(".ekspanderbartPanel__hode").props().onClick?.(event));
    act(() => behandlingsmeny.find(AvsluttSak).find(".ekspanderbartPanel__hode").props().onClick?.(event));
    behandlingsmeny.update();

    const leggBehandlingTilbakeHandlinger = behandlingsmeny.find(LeggBehandlingTilbake).find(Handling);
    expect(leggBehandlingTilbakeHandlinger).toHaveLength(2);
    expect(leggBehandlingTilbakeHandlinger.at(0).text()).toEqual("Til min oppgaveliste");
    expect(leggBehandlingTilbakeHandlinger.at(1).text()).toEqual("Til felles oppgaveliste");
    expect(leggBehandlingTilbakeHandlinger.at(1).props().disabled).toBeFalsy();

    const avsluttSakHandlinger = behandlingsmeny.find(AvsluttSak).find(Handling);
    expect(avsluttSakHandlinger).toHaveLength(3);
    expect(avsluttSakHandlinger.at(0).text()).toEqual("Avslå søknad pga. manglende opplysninger");
    expect(avsluttSakHandlinger.at(1).text()).toEqual("Henlegg sak");
    expect(avsluttSakHandlinger.at(2).text()).toEqual("Avslutt sak som bortfalt");

    const menyHandlinger = behandlingsmeny.find(".behandlingsmeny__meny__handlinger").find(Handling);
    expect(menyHandlinger).toHaveLength(2);
    expect(menyHandlinger.at(0).text()).toEqual("copy.svgVis saksoversikt");
    expect(menyHandlinger.at(1).text()).toEqual("cancel.svgVurder saken på nytt");
  });

  it("viser bare saksoversikt", () => {
    props.behandlingstema = BESLUTNING_LOVVALG_NORGE;
    props.redigerbart = false;
    const behandlingsmeny = mount(<Behandlingsmeny {...props} />);

    act(() => behandlingsmeny.find(".behandlingsmeny__knapp").props().onClick?.(event));
    behandlingsmeny.update();
    act(() => behandlingsmeny.find(LeggBehandlingTilbake).find(".ekspanderbartPanel__hode").props().onClick?.(event));
    behandlingsmeny.update();

    const tilFellesOppgaveliste = behandlingsmeny.find(LeggBehandlingTilbake).find(Handling);
    expect(tilFellesOppgaveliste).toHaveLength(1);
    expect(tilFellesOppgaveliste.text()).toEqual("Til felles oppgaveliste");
    expect(tilFellesOppgaveliste.props().disabled).toBeTruthy();

    expect(behandlingsmeny.find(AvsluttSak).children()).toHaveLength(0);

    const visSaksoversikt = behandlingsmeny.find(".behandlingsmeny__meny__handlinger").find(Handling);
    expect(visSaksoversikt).toHaveLength(1);
    expect(visSaksoversikt.text()).toEqual("copy.svgVis saksoversikt");
  });
});
