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
  YRKESAKTIV,
  UTSENDT_ARBEIDSTAKER,
  REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
  REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
} = MKV.Koder.behandlinger.behandlingstema;
const { NY_VURDERING, FØRSTEGANG, HENVENDELSE } = MKV.Koder.behandlinger.behandlingstyper;
const { FTRL, TRYGDEAVTALE } = MKV.Koder.sakstyper;
const { MEDLEMSKAP_LOVVALG, UNNTAK } = MKV.Koder.sakstemaer;
const { VURDER_DOKUMENT } = MKV.Koder.behandlinger.behandlingsstatus;

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
    expect(handlinger.at(1).props().tekst).toBe("Søknaden er henlagt/trukket");
    expect(handlinger.at(2).props().tekst).toBe("Kan ikke behandles i Melosys");
  });

  it("viser bare avsluttSak om tema er trygdetid", () => {
    props.behandlingstema = TRYGDETID;
    props.redigerbart = true;

    const avsluttSak = shallow(<AvsluttSak {...props} />);
    const handlinger = avsluttSak.find(Handling);

    expect(handlinger).toHaveLength(1);
    expect(handlinger.props().tekst).toBe("Kan ikke behandles i Melosys");
  });

  it("viser ferdigBehandlet om tema er yrkesaktiv", () => {
    props.behandlingstema = YRKESAKTIV;
    props.redigerbart = true;
    props.behandlingstype = NY_VURDERING;

    const avsluttSak = shallow(<AvsluttSak {...props} />);
    const handlinger = avsluttSak.find(Handling);

    expect(handlinger).toHaveLength(4);
    expect(handlinger.at(3).props().tekst).toBe("Ferdigbehandlet");
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

  describe("Kan ikke behandles i Melosys", () => {
    it(`viser 'Kan ikke behandles i Melosys' dersom behandlingstema er ${REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE} og behandlingsstatus er ${VURDER_DOKUMENT}`, () => {
      props.behandlingstema = REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE;
      props.behandlingsstatus = VURDER_DOKUMENT;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(1);
      expect(handlinger.at(0).props().tekst).toBe("Kan ikke behandles i Melosys");
    });

    it(`viser 'Kan ikke behandles i Melosys' dersom behandlingstema er ${REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING} og behandlingsstatus er ${VURDER_DOKUMENT}`, () => {
      props.behandlingstema = REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING;
      props.behandlingsstatus = VURDER_DOKUMENT;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(1);
      expect(handlinger.at(0).props().tekst).toBe("Kan ikke behandles i Melosys");
    });
  });

  describe("Søknaden er avslått", () => {
    it(`viser 'Søknaden er avslått' dersom behandlingstype er ${FØRSTEGANG} og behandlingstema er ${YRKESAKTIV}`, () => {
      props.redigerbart = true;
      props.sakstema = MEDLEMSKAP_LOVVALG;
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(4);
      expect(handlinger.at(0).props().tekst).toBe("Søknaden er avslått");
    });

    it(`viser ikke 'Søknaden er avslått' dersom behandlingstype er ${HENVENDELSE} og behandlingstema er ${YRKESAKTIV}`, () => {
      props.redigerbart = true;
      props.sakstema = MEDLEMSKAP_LOVVALG;
      props.behandlingstype = HENVENDELSE;
      props.behandlingstema = YRKESAKTIV;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const soknadenErAvslatt = avsluttSak.findWhere(
        (n) => n.type() === Handling && n.props().tekst === "Søknaden er avslått"
      );

      expect(soknadenErAvslatt).toHaveLength(0);
    });

    it(`viser ikke 'Søknaden er avslått' dersom sakstema er ${UNNTAK}`, () => {
      props.redigerbart = true;
      props.sakstema = UNNTAK;
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const soknadenErAvslatt = avsluttSak.findWhere(
        (n) => n.type() === Handling && n.props().tekst === "Søknaden er avslått"
      );

      expect(soknadenErAvslatt).toHaveLength(0);
    });

    it(`viser ikke 'Søknaden er avslått' dersom redigerbart er false`, () => {
      props.redigerbart = false;
      props.sakstema = MEDLEMSKAP_LOVVALG;
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(0);
    });
  });

  describe("Søknaden er innvilget", () => {
    it(`viser 'Søknaden er innvilget' dersom sakstype er ${FTRL} og behandlingstype er ${FØRSTEGANG} og behandlingstema er ${YRKESAKTIV}`, () => {
      props.redigerbart = true;
      props.sakstema = MEDLEMSKAP_LOVVALG;
      props.sakstype = FTRL;
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(5);
      expect(handlinger.at(0).props().tekst).toBe("Søknaden er innvilget");
    });

    it(`viser 'Søknaden er innvilget' dersom sakstype er ${TRYGDEAVTALE} og behandlingstype er ${FØRSTEGANG} og behandlingstema er ${YRKESAKTIV}`, () => {
      props.redigerbart = true;
      props.sakstema = MEDLEMSKAP_LOVVALG;
      props.sakstype = TRYGDEAVTALE;
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(5);
      expect(handlinger.at(0).props().tekst).toBe("Søknaden er innvilget");
    });

    it(`viser ikke 'Søknaden er innvilget' dersom sakstype er ${TRYGDEAVTALE} og behandlingstype er ${HENVENDELSE} og behandlingstema er ${YRKESAKTIV}`, () => {
      props.redigerbart = true;
      props.sakstema = MEDLEMSKAP_LOVVALG;
      props.sakstype = TRYGDEAVTALE;
      props.behandlingstype = HENVENDELSE;
      props.behandlingstema = YRKESAKTIV;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const soknadenErInnvilget = avsluttSak.findWhere(
        (n) => n.type() === Handling && n.props().tekst === "Søknaden er innvilget"
      );

      expect(soknadenErInnvilget).toHaveLength(0);
    });

    it(`viser ikke 'Søknaden er innvilget' dersom sakstema er ${UNNTAK}`, () => {
      props.redigerbart = true;
      props.sakstema = UNNTAK;
      props.sakstype = TRYGDEAVTALE;
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const soknadenErInnvilget = avsluttSak.findWhere(
        (n) => n.type() === Handling && n.props().tekst === "Søknaden er innvilget"
      );

      expect(soknadenErInnvilget).toHaveLength(0);
    });

    it(`viser ikke 'Søknaden er innvilget' dersom redigerbart er false`, () => {
      props.redigerbart = false;
      props.sakstema = MEDLEMSKAP_LOVVALG;
      props.sakstype = TRYGDEAVTALE;
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(0);
    });
  });
});
