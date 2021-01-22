import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";
import each from "jest-each";

import * as Nav from "../../utils/navFrontend";
import * as Etiketter from "./etiketter";

import MKV from "../../melosyskodeverk";

import { Menypanel } from "./menypanel";
import Sidemeny from "../sidemeny";

const {
  SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS,
  SØKNAD_A1_YRKESAKTIVE_EØS,
  SED,
  SØKNAD_FOLKETRYGDEN,
} = MKV.Koder.behandlingsgrunnlagtyper;

const { behandlingstyper } = MKV.Koder.behandlinger;

const {
  UTSENDT_ARBEIDSTAKER,
  UTSENDT_SELVSTENDIG,
  ARBEID_FLERE_LAND,
  IKKE_YRKESAKTIV,
  ARBEID_ETT_LAND_ØVRIG,
  ARBEID_NORGE_BOSATT_ANNET_LAND,
  REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
  REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
  ANMODNING_OM_UNNTAK_HOVEDREGEL,
  BESLUTNING_LOVVALG_NORGE,
  BESLUTNING_LOVVALG_ANNET_LAND,
  ØVRIGE_SED_MED,
  ØVRIGE_SED_UFM,
  TRYGDETID,
  ARBEID_I_UTLANDET,
} = MKV.Koder.behandlinger.behandlingstema;

describe("MenyPanel", () => {
  const mockedProps = mock<ComponentProps<typeof Menypanel>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.visMenypanel = true;
  });

  each([
    UTSENDT_ARBEIDSTAKER,
    UTSENDT_SELVSTENDIG,
    ARBEID_FLERE_LAND,
    IKKE_YRKESAKTIV,
    ARBEID_ETT_LAND_ØVRIG,
    ARBEID_NORGE_BOSATT_ANNET_LAND,
  ]).it("Viser korrekte menypunkter for behandlingstema %p", (behandlingstema) => {
    props.behandlingstema = behandlingstema;
    const menypanel = shallow(<Menypanel {...props} />);
    const sidemeny = menypanel.find(Sidemeny);
    const sidemenyLinkGroups = sidemeny.props().linkGroups;

    expect(sidemenyLinkGroups[0].label).toBe("FRA REGISTER OG SØKNAD");
    expect(sidemenyLinkGroups[0].links).toHaveLength(2);
    expect(sidemenyLinkGroups[0].links[0].label).toBe("Person");
    expect(sidemenyLinkGroups[0].links[1].label).toBe("Familieforhold");

    expect(sidemenyLinkGroups[1].label).toBe("FRA REGISTER");
    expect(sidemenyLinkGroups[1].links).toHaveLength(3);
    expect(sidemenyLinkGroups[1].links[0].label).toBe("Medlemskap");
    expect(sidemenyLinkGroups[1].links[1].label).toBe("EU/EØS-barnetrygd");
    expect(sidemenyLinkGroups[1].links[2].label).toBe("Arbeidsforhold og inntekt");

    expect(sidemenyLinkGroups[2].label).toBe("FRA SØKNAD");
    expect(sidemenyLinkGroups[2].links).toHaveLength(4);
    expect(sidemenyLinkGroups[2].links[0].label).toBe("Arbeidsgiver/virksomhet");
    expect(sidemenyLinkGroups[2].links[1].label).toBe("Fullmektig");
    expect(sidemenyLinkGroups[2].links[2].label).toBe("Periode");
    expect(sidemenyLinkGroups[2].links[3].label).toBe("Arbeidssted(er)");
  });

  each([BESLUTNING_LOVVALG_ANNET_LAND, ANMODNING_OM_UNNTAK_HOVEDREGEL, ØVRIGE_SED_MED, ØVRIGE_SED_UFM, TRYGDETID]).it(
    "Viser korrekte menypunkter for behandlingstema %p",
    (behandlingstema) => {
      props.behandlingstema = behandlingstema;
      const menypanel = shallow(<Menypanel {...props} />);
      const sidemeny = menypanel.find(Sidemeny);
      const sidemenyLinkGroups = sidemeny.props().linkGroups;

      expect(sidemenyLinkGroups[0].label).toBe("FRA REGISTER");
      expect(sidemenyLinkGroups[0].links).toHaveLength(5);
      expect(sidemenyLinkGroups[0].links[0].label).toBe("Person");
      expect(sidemenyLinkGroups[0].links[1].label).toBe("Familieforhold");
      expect(sidemenyLinkGroups[0].links[2].label).toBe("Medlemskap");
      expect(sidemenyLinkGroups[0].links[3].label).toBe("EU/EØS-barnetrygd");
      expect(sidemenyLinkGroups[0].links[4].label).toBe("Arbeidsforhold og inntekt");
    }
  );

  each([REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING, REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE]).it(
    "Viser korrekte menypunkter for behandlingstema %p",
    (behandlingstema) => {
      props.behandlingstema = behandlingstema;
      const menypanel = shallow(<Menypanel {...props} />);
      const sidemeny = menypanel.find(Sidemeny);
      const sidemenyLinkGroups = sidemeny.props().linkGroups;

      expect(sidemenyLinkGroups[0].label).toBe("FRA REGISTER");
      expect(sidemenyLinkGroups[0].links).toHaveLength(4);
      expect(sidemenyLinkGroups[0].links[0].label).toBe("Person");
      expect(sidemenyLinkGroups[0].links[1].label).toBe("Familieforhold");
      expect(sidemenyLinkGroups[0].links[2].label).toBe("Medlemskap");
      expect(sidemenyLinkGroups[0].links[3].label).toBe("EU/EØS-barnetrygd");
    }
  );

  each([BESLUTNING_LOVVALG_NORGE]).it("Viser korrekte menypunkter for behandlingstema %p", (behandlingstema) => {
    props.behandlingstema = behandlingstema;
    const menypanel = shallow(<Menypanel {...props} />);
    const sidemeny = menypanel.find(Sidemeny);
    const sidemenyLinkGroups = sidemeny.props().linkGroups;

    expect(sidemenyLinkGroups[0].label).toBe("FRA REGISTER OG SED");
    expect(sidemenyLinkGroups[0].links).toHaveLength(2);
    expect(sidemenyLinkGroups[0].links[0].label).toBe("Person");
    expect(sidemenyLinkGroups[0].links[1].label).toBe("Familieforhold");

    expect(sidemenyLinkGroups[1].label).toBe("FRA REGISTER");
    expect(sidemenyLinkGroups[1].links).toHaveLength(3);
    expect(sidemenyLinkGroups[1].links[0].label).toBe("Medlemskap");
    expect(sidemenyLinkGroups[1].links[1].label).toBe("EU/EØS-barnetrygd");
    expect(sidemenyLinkGroups[1].links[2].label).toBe("Arbeidsforhold og inntekt");

    expect(sidemenyLinkGroups[2].label).toBe("FRA SED");
    expect(sidemenyLinkGroups[2].links).toHaveLength(4);
    expect(sidemenyLinkGroups[2].links[0].label).toBe("Arbeidsgiver/virksomhet");
    expect(sidemenyLinkGroups[2].links[1].label).toBe("Fullmektig");
    expect(sidemenyLinkGroups[2].links[2].label).toBe("Periode");
    expect(sidemenyLinkGroups[2].links[3].label).toBe("Arbeidssted(er)");
  });

  each([ARBEID_I_UTLANDET]).it("Viser korrekte menypunkter for behandlingstema %p", (behandlingstema) => {
    props.behandlingstema = behandlingstema;
    const menypanel = shallow(<Menypanel {...props} />);
    const sidemeny = menypanel.find(Sidemeny);
    const sidemenyLinkGroups = sidemeny.props().linkGroups;

    expect(sidemenyLinkGroups[0].label).toBe("FRA REGISTER OG SØKNAD");
    expect(sidemenyLinkGroups[0].links).toHaveLength(2);
    expect(sidemenyLinkGroups[0].links[0].label).toBe("Person");
    expect(sidemenyLinkGroups[0].links[1].label).toBe("Familieforhold");

    expect(sidemenyLinkGroups[1].label).toBe("FRA REGISTER");
    expect(sidemenyLinkGroups[1].links).toHaveLength(3);
    expect(sidemenyLinkGroups[1].links[0].label).toBe("Medlemskap");
    expect(sidemenyLinkGroups[1].links[1].label).toBe("EU/EØS-barnetrygd");
    expect(sidemenyLinkGroups[1].links[2].label).toBe("Arbeidsforhold og inntekt");

    expect(sidemenyLinkGroups[2].label).toBe("FRA SØKNAD");
    expect(sidemenyLinkGroups[2].links).toHaveLength(2);
    expect(sidemenyLinkGroups[2].links[0].label).toBe("Arbeidsgiver/virksomhet");
    expect(sidemenyLinkGroups[2].links[1].label).toBe("Fullmektig");
  });

  it("hvis behandlingsgrunnlagtype er SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS vises arbeidsforholdrolleetiketter", () => {
    props.behandlingsgrunnlagtype = SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS;
    const menypanel = shallow(<Menypanel {...props} />);
    const activeContent = menypanel.find(Nav.Panel);

    expect(activeContent.children().props().visArbeidsforholdRolleEtiketter).toBe(true);
  });

  each([SØKNAD_A1_YRKESAKTIVE_EØS, SED, SØKNAD_FOLKETRYGDEN]).it(
    "viser ikke arbeidsforholdrolleetiketter hvis behandlingsgrunnlagtype er %p",
    (behandlingsgrunnlagtype) => {
      props.behandlingsgrunnlagtype = behandlingsgrunnlagtype;
      const menypanel = shallow(<Menypanel {...props} />);
      const activeContent = menypanel.find(Nav.Panel);

      expect(activeContent.children().props().visArbeidsforholdRolleEtiketter).toBe(false);
    }
  );

  each([
    BESLUTNING_LOVVALG_ANNET_LAND,
    REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
    REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
    ANMODNING_OM_UNNTAK_HOVEDREGEL,
    ØVRIGE_SED_MED,
    ØVRIGE_SED_UFM,
    TRYGDETID,
  ]).it(
    `viser ikke behandlingsgrunnlagdata hvis behandlingstype er ${behandlingstyper.SED} og behandlingstema er %p`,
    (behandlingstema) => {
      props.behandlingstype = behandlingstyper.SED;
      props.behandlingstema = behandlingstema;
      const menypanel = shallow(<Menypanel {...props} />);
      const activeContent = menypanel.find(Nav.Panel);

      expect(activeContent.children().props().visBehandlingsgrunnlagData).toBe(false);
    }
  );

  each([behandlingstyper.SED]).it(
    'viser behandlingsgrunnlagetikett med tekst "Fra SED" ved behandlingstype %p',
    (behandlingstype) => {
      props.behandlingstype = behandlingstype;
      const menypanel = shallow(<Menypanel {...props} />);
      const activeContent = menypanel.find(Nav.Panel);

      expect(activeContent.children().props().behandlingsgrunnlagEtikett).toEqual(<Etiketter.FraSed />);
    }
  );

  each([behandlingstyper.SOEKNAD, behandlingstyper.NY_VURDERING, behandlingstyper.ENDRET_PERIODE]).it(
    'viser behandlingsgrunnlagetikett med tekst "Fra Søknad" ved behandlingstype %p',
    (behandlingstype) => {
      props.behandlingstype = behandlingstype;
      const menypanel = shallow(<Menypanel {...props} />);
      const activeContent = menypanel.find(Nav.Panel);

      expect(activeContent.children().props().behandlingsgrunnlagEtikett).toEqual(<Etiketter.FraSoknad />);
    }
  );

  each([ARBEID_I_UTLANDET]).it(
    `viser familie med på reisen istedenfor barn med på reisen hvis behandlingstema er %p`,
    (behandlingstema) => {
      props.behandlingstema = behandlingstema;
      const menypanel = shallow(<Menypanel {...props} />);

      const sidemeny = menypanel.find(Sidemeny);
      sidemeny.props().onClick(0, 1);
      const activeContent = menypanel.find(Nav.Panel);

      expect(activeContent.children().props().visEktefelleSamboerMedPaReisen).toBe(true);
    }
  );

  each([
    UTSENDT_ARBEIDSTAKER,
    UTSENDT_SELVSTENDIG,
    ARBEID_FLERE_LAND,
    IKKE_YRKESAKTIV,
    ARBEID_ETT_LAND_ØVRIG,
    ARBEID_NORGE_BOSATT_ANNET_LAND,
    REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
    REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
    ANMODNING_OM_UNNTAK_HOVEDREGEL,
    BESLUTNING_LOVVALG_NORGE,
    BESLUTNING_LOVVALG_ANNET_LAND,
    ØVRIGE_SED_MED,
    ØVRIGE_SED_UFM,
    TRYGDETID,
  ]).it(`viser ikke familie med på reisen hvis behandlingstema er %p`, (behandlingstema) => {
    props.behandlingstema = behandlingstema;
    const menypanel = shallow(<Menypanel {...props} />);

    const sidemeny = menypanel.find(Sidemeny);
    sidemeny.props().onClick(0, 1);
    const activeContent = menypanel.find(Nav.Panel);

    expect(activeContent.children().props().visEktefelleSamboerMedPaReisen).toBe(false);
  });
});
