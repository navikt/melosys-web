import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { shallow } from "enzyme";

import MKV from "../../../melosyskodeverk";

import AvsluttSak from "./avsluttsak";
import Handling from "./handling";

const {
  BESLUTNING_LOVVALG_NORGE,
  TRYGDETID,
  YRKESAKTIV,
  UTSENDT_ARBEIDSTAKER,
  REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
  REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
  ANMODNING_OM_UNNTAK_HOVEDREGEL,
  REGISTRERING_UNNTAK,
} = MKV.Koder.behandlinger.behandlingstema;
const { NY_VURDERING, FØRSTEGANG, HENVENDELSE, KLAGE } = MKV.Koder.behandlinger.behandlingstyper;
const { FTRL, TRYGDEAVTALE, EU_EOS } = MKV.Koder.sakstyper;
const { MEDLEMSKAP_LOVVALG, UNNTAK } = MKV.Koder.sakstemaer;
const { VURDER_DOKUMENT } = MKV.Koder.behandlinger.behandlingsstatus;

const mockedProps = mock<ComponentProps<typeof AvsluttSak>>();

jest.mock("../../../featuretoggle", () => ({
  __esModule: true,
  useFeatureToggle: () => "enabled",
}));

describe("AvsluttSak", () => {
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  const setupProps = (initialProps: typeof mockedProps) => {
    initialProps.redigerbart = true;
    initialProps.sakstype = EU_EOS;
    initialProps.sakstema = MEDLEMSKAP_LOVVALG;
    initialProps.behandlingstema = UTSENDT_ARBEIDSTAKER;
    initialProps.behandlingstype = FØRSTEGANG;
  };

  it("viser riktige valg for sakstype FTRL og behandlingstype FØRSTEGANG ", () => {
    setupProps(props);
    props.sakstype = FTRL;
    props.behandlingstema = YRKESAKTIV;

    const avsluttSak = shallow(<AvsluttSak {...props} />);
    const handlinger = avsluttSak.find(Handling);

    expect(handlinger).toHaveLength(6);
    expect(handlinger.at(0).props().tekst).toBe("Søknaden er innvilget");
    expect(handlinger.at(1).props().tekst).toBe("Søknaden er avslått");
    expect(handlinger.at(2).props().tekst).toBe("Avslå søknad pga. manglende opplysninger");
    expect(handlinger.at(3).props().tekst).toBe("Ferdigbehandlet");
    expect(handlinger.at(4).props().tekst).toBe("Søknaden/klagen er trukket");
    expect(handlinger.at(5).props().tekst).toBe("Behandlingen er bortfalt");
  });

  it("viser bare avsluttSak dersom tema er trygdetid", () => {
    setupProps(props);
    props.behandlingstema = TRYGDETID;

    const avsluttSak = shallow(<AvsluttSak {...props} />);
    const handlinger = avsluttSak.find(Handling);

    expect(handlinger).toHaveLength(2);
    expect(handlinger.at(1).props().tekst).toBe("Behandlingen er bortfalt");
  });

  it("viser ferdigBehandlet dersom tema er yrkesaktiv og type er ny vurdering", () => {
    setupProps(props);
    props.behandlingstema = YRKESAKTIV;
    props.behandlingstype = NY_VURDERING;

    const avsluttSak = shallow(<AvsluttSak {...props} />);
    const handlinger = avsluttSak.find(Handling);

    expect(handlinger.at(3).props().tekst).toBe("Ferdigbehandlet");
  });

  it("returerer null om EØS_VURDER_UTPEKING og ikke redigerbart", () => {
    setupProps(props);
    props.redigerbart = false;
    props.behandlingstema = BESLUTNING_LOVVALG_NORGE;

    const avsluttSak = shallow(<AvsluttSak {...props} />);

    expect(avsluttSak.find(".behandlingsmeny__meny__avslutt-sak").isEmptyRender()).toBeTruthy();
  });

  it(`viser ikke 'Avslutt sak som bortfalt' dersom behandlingstema er ${UTSENDT_ARBEIDSTAKER} og behandlingstype er ${NY_VURDERING}`, () => {
    setupProps(props);
    props.behandlingstema = UTSENDT_ARBEIDSTAKER;
    props.behandlingstype = NY_VURDERING;

    const avsluttSak = shallow(<AvsluttSak {...props} />);

    const avsluttSakSomBortfalt = avsluttSak.findWhere(
      (n) => n.type() === Handling && n.props().tekst === "Avslutt sak som bortfalt"
    );
    expect(avsluttSakSomBortfalt).toHaveLength(0);
  });

  describe("Ferdigbehandlet", () => {
    it(`viser 'Ferdigbehandlet' dersom behandlingstema er ${BESLUTNING_LOVVALG_NORGE} og behandlingstype er ${NY_VURDERING}`, () => {
      setupProps(props);
      props.behandlingstema = BESLUTNING_LOVVALG_NORGE;
      props.behandlingstype = NY_VURDERING;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(3);
      expect(handlinger.at(1).props().tekst).toBe("Ferdigbehandlet");
    });

    it(`viser 'Ferdigbehandlet' dersom behandlingstema er ${YRKESAKTIV}`, () => {
      setupProps(props);
      props.behandlingstema = YRKESAKTIV;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(4);
      expect(handlinger.at(2).props().tekst).toBe("Ferdigbehandlet");
    });

    it(`viser ikke 'Ferdigbehandlet' dersom behandling ikke er redigerbart`, () => {
      setupProps(props);
      props.redigerbart = false;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(0);
    });
  });

  describe("Behandlingen er bortfalt", () => {
    it(`viser 'Behandlingen er bortfalt' dersom behandlingstema er ${REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE} og behandlingsstatus er ${VURDER_DOKUMENT}`, () => {
      setupProps(props);
      props.behandlingstema = REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE;
      props.behandlingsstatus = VURDER_DOKUMENT;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(2);
      expect(handlinger.at(1).props().tekst).toBe("Behandlingen er bortfalt");
    });

    it(`viser 'Behandlingen er bortfalt' dersom behandlingstema er ${REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING} og behandlingsstatus er ${VURDER_DOKUMENT}`, () => {
      setupProps(props);
      props.behandlingstema = REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING;
      props.behandlingsstatus = VURDER_DOKUMENT;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(2);
      expect(handlinger.at(1).props().tekst).toBe("Behandlingen er bortfalt");
    });
  });

  describe("Søknaden er avslått", () => {
    it(`viser 'Søknaden er avslått' dersom sakstype er EØS behandlingstype er ${FØRSTEGANG} og behandlingstema er ${YRKESAKTIV}`, () => {
      setupProps(props);
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(4);
      expect(handlinger.at(1).props().tekst).toBe("Søknaden er avslått");
    });

    it(`viser ikke 'Søknaden er avslått' dersom behandlingstype er ${HENVENDELSE} og behandlingstema er ${YRKESAKTIV}`, () => {
      setupProps(props);
      props.behandlingstype = HENVENDELSE;
      props.behandlingstema = YRKESAKTIV;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const soknadenErAvslatt = avsluttSak.findWhere(
        (n) => n.type() === Handling && n.props().tekst === "Søknaden er avslått"
      );

      expect(soknadenErAvslatt).toHaveLength(0);
    });

    it(`viser ikke 'Søknaden er avslått' dersom sakstema er ${UNNTAK}`, () => {
      setupProps(props);
      props.sakstema = UNNTAK;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const soknadenErAvslatt = avsluttSak.findWhere(
        (n) => n.type() === Handling && n.props().tekst === "Søknaden er avslått"
      );

      expect(soknadenErAvslatt).toHaveLength(0);
    });

    it(`viser ikke 'Søknaden er avslått' dersom redigerbart er false`, () => {
      setupProps(props);
      props.redigerbart = false;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(0);
    });
  });

  describe("Søknaden er innvilget", () => {
    it(`viser 'Søknaden er innvilget' dersom sakstype er ${FTRL} og behandlingstype er ${FØRSTEGANG} og behandlingstema er ${YRKESAKTIV}`, () => {
      setupProps(props);
      props.sakstype = FTRL;
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(6);
      expect(handlinger.at(0).props().tekst).toBe("Søknaden er innvilget");
    });

    it(`viser 'Søknaden er innvilget' dersom sakstype er ${TRYGDEAVTALE} og behandlingstype er ${FØRSTEGANG} og behandlingstema er ${YRKESAKTIV}`, () => {
      setupProps(props);
      props.sakstype = TRYGDEAVTALE;
      props.behandlingstype = FØRSTEGANG;
      props.behandlingstema = YRKESAKTIV;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(6);
      expect(handlinger.at(0).props().tekst).toBe("Søknaden er innvilget");
    });

    it(`viser ikke 'Søknaden er innvilget' dersom sakstype er ${TRYGDEAVTALE} og behandlingstype er ${HENVENDELSE} og behandlingstema er ${YRKESAKTIV}`, () => {
      setupProps(props);
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
      setupProps(props);
      props.sakstema = UNNTAK;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const soknadenErInnvilget = avsluttSak.findWhere(
        (n) => n.type() === Handling && n.props().tekst === "Søknaden er innvilget"
      );

      expect(soknadenErInnvilget).toHaveLength(0);
    });

    it(`viser ikke 'Søknaden er innvilget' dersom redigerbart er false`, () => {
      setupProps(props);
      props.redigerbart = false;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(0);
    });
  });

  describe("Klage-handlinger", () => {
    it(`viser Klage-handlinger dersom behandlingstype er ${KLAGE}`, () => {
      setupProps(props);
      props.behandlingstype = KLAGE;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(4);
      expect(handlinger.at(0).props().tekst).toBe("Medhold på klage");
      expect(handlinger.at(1).props().tekst).toBe("Klageinnstilling er oversendt til klageinstansen");
      expect(handlinger.at(2).props().tekst).toBe("Klage er avvist");
    });

    it(`viser ikke Klage-handlinger dersom behandlingstype er ${FØRSTEGANG}`, () => {
      setupProps(props);
      props.behandlingstype = FØRSTEGANG;

      const avsluttSak = shallow(<AvsluttSak {...props} />);

      expect(avsluttSak.findWhere((n) => n.type() === Handling && n.props().tekst === "Medhold på klage")).toHaveLength(
        0
      );

      expect(
        avsluttSak.findWhere(
          (n) => n.type() === Handling && n.props().tekst === "Klageinnstilling er oversendt til klageinstansen"
        )
      ).toHaveLength(0);

      expect(avsluttSak.findWhere((n) => n.type() === Handling && n.props().tekst === "Klage er avvist")).toHaveLength(
        0
      );
    });
  });

  describe("Vedtaket er omgjort (fvl § 35)", () => {
    it(`viser 'Vedtaket er omgjort (fvl § 35)' dersom behandlingstype er ${NY_VURDERING}`, () => {
      setupProps(props);
      props.behandlingstype = NY_VURDERING;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(5);
      expect(handlinger.at(1).props().tekst).toBe("Vedtaket er omgjort (fvl § 35)");
    });

    it(`viser ikke 'Vedtaket er omgjort (fvl § 35)' dersom behandlingstype er ${FØRSTEGANG}`, () => {
      setupProps(props);
      props.behandlingstype = FØRSTEGANG;

      const avsluttSak = shallow(<AvsluttSak {...props} />);

      expect(
        avsluttSak.findWhere((n) => n.type() === Handling && n.props().tekst === "Vedtaket er omgjort (fvl § 35)")
      ).toHaveLength(0);
    });
  });

  describe("Unntak-handlinger", () => {
    it(`viser Unntak-handlinger dersom behandlingstema er ${ANMODNING_OM_UNNTAK_HOVEDREGEL} og sakstype er ${TRYGDEAVTALE}`, () => {
      setupProps(props);
      props.behandlingstema = ANMODNING_OM_UNNTAK_HOVEDREGEL;
      props.sakstype = TRYGDEAVTALE;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(5);
      expect(handlinger.at(0).props().tekst).toBe("Perioden er godkjent");
      expect(handlinger.at(1).props().tekst).toBe("Perioden er delvis godkjent");
      expect(handlinger.at(2).props().tekst).toBe("Medlem i folketrygden");
      expect(handlinger.at(3).props().tekst).toBe("Ferdigbehandlet");
      expect(handlinger.at(4).props().tekst).toBe("Behandlingen er bortfalt");
    });

    it(`viser Unntak-handlinger dersom behandlingstema er ${REGISTRERING_UNNTAK} og sakstype er ${TRYGDEAVTALE}`, () => {
      setupProps(props);
      props.behandlingstema = REGISTRERING_UNNTAK;
      props.sakstype = TRYGDEAVTALE;

      const avsluttSak = shallow(<AvsluttSak {...props} />);
      const handlinger = avsluttSak.find(Handling);

      expect(handlinger).toHaveLength(5);
      expect(handlinger.at(0).props().tekst).toBe("Perioden er godkjent");
      expect(handlinger.at(1).props().tekst).toBe("Perioden er delvis godkjent");
      expect(handlinger.at(2).props().tekst).toBe("Medlem i folketrygden");
      expect(handlinger.at(3).props().tekst).toBe("Ferdigbehandlet");
      expect(handlinger.at(4).props().tekst).toBe("Behandlingen er bortfalt");
    });
  });
});
