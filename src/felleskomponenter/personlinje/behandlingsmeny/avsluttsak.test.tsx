import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { shallow } from "enzyme";

import MKV from "../../../melosyskodeverk";

import AvsluttSak from "./avsluttsak";
import Handling from "./handling";

const {
  BESLUTNING_LOVVALG_NORGE,
  ARBEID_I_UTLANDET,
  TRYGDETID,
  UTSENDT_ARBEIDSTAKER,
} = MKV.Koder.behandlinger.behandlingstema;
const { NY_VURDERING } = MKV.Koder.behandlinger.behandlingstyper;

const mockedProps = mock<ComponentProps<typeof AvsluttSak>>();

describe("AvsluttSak", () => {
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("viser alle valg om FTRL_SAKSBEHANDLING og redigerbart", () => {
    props.behandlingstema = ARBEID_I_UTLANDET;
    props.redigerbart = true;

    const avsluttSak = shallow(<AvsluttSak {...props} />);
    const handlinger = avsluttSak.find(Handling);

    expect(handlinger).toHaveLength(3);
    expect(handlinger.at(0).props().tekst).toBe("Avslå søknad pga. manglende opplysninger");
    expect(handlinger.at(1).props().tekst).toBe("Henlegg sak");
    expect(handlinger.at(2).props().tekst).toBe("Avslutt sak som bortfalt");
  });

  it("viser bare avsluttSak om tema er trygdetid", () => {
    props.behandlingstema = TRYGDETID;
    props.redigerbart = true;

    const avsluttSak = shallow(<AvsluttSak {...props} />);
    const handlinger = avsluttSak.find(Handling);

    expect(handlinger).toHaveLength(1);
    expect(handlinger.props().tekst).toBe("Avslutt sak som bortfalt");
  });

  it("returerer null om EØS_VURDER_UTPEKING og ikke redigerbart", () => {
    props.redigerbart = false;
    props.behandlingstema = BESLUTNING_LOVVALG_NORGE;

    const avsluttSak = shallow(<AvsluttSak {...props} />);

    expect(avsluttSak.find(".behandlingsmeny__meny__avslutt-sak").isEmptyRender()).toBeTruthy();
  });

  it(`viser ikke 'Avslutt sak som bortfalt' dersom behandlingstema er ${UTSENDT_ARBEIDSTAKER} og behandlingstype er ${NY_VURDERING}`, () => {
    props.redigerbart = true;
    props.behandlingstema = UTSENDT_ARBEIDSTAKER;
    props.behandlingstype = NY_VURDERING;

    const avsluttSak = shallow(<AvsluttSak {...props} />);

    const avsluttSakSomBortfalt = avsluttSak.findWhere(
      (n) => n.type() === Handling && n.props().tekst === "Avslutt sak som bortfalt"
    );
    expect(avsluttSakSomBortfalt).toHaveLength(0);
  });
});
