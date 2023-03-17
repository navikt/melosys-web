import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";
import each from "jest-each";

import * as Nav from "../../navFrontend";

import MKV from "../../melosyskodeverk";

import { Menypanel } from "./menypanel";
import Sidemeny from "../sidemeny";

const { SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS, SØKNAD_A1_YRKESAKTIVE_EØS, SED, SØKNAD_FOLKETRYGDEN } =
  MKV.Koder.mottatteopplysningertyper;

const { behandlingstyper } = MKV.Koder.behandlinger;
const {
  UTSENDT_ARBEIDSTAKER,
  UTSENDT_SELVSTENDIG,
  ARBEID_FLERE_LAND,
  IKKE_YRKESAKTIV,
  ARBEID_TJENESTEPERSON_ELLER_FLY,
  ARBEID_NORGE_BOSATT_ANNET_LAND,
  REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
  REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
  ANMODNING_OM_UNNTAK_HOVEDREGEL,
  BESLUTNING_LOVVALG_NORGE,
  BESLUTNING_LOVVALG_ANNET_LAND,
  TRYGDETID,
  ARBEID_I_UTLANDET,
} = MKV.Koder.behandlinger.behandlingstema;

describe("MenyPanel", () => {
  const mockedProps = mock<ComponentProps<typeof Menypanel>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.menypanel = { synlig: true };
  });

  each([
    UTSENDT_ARBEIDSTAKER,
    UTSENDT_SELVSTENDIG,
    ARBEID_FLERE_LAND,
    ARBEID_TJENESTEPERSON_ELLER_FLY,
    ARBEID_NORGE_BOSATT_ANNET_LAND,
  ]).it("Viser korrekte menypunkter for behandlingstema %p", (behandlingstema) => {
    props.behandlingstema = behandlingstema;
    const menypanel = shallow(<Menypanel {...props} />);
    const sidemeny = menypanel.find(Sidemeny);
    const sidemenyLinkGroups = sidemeny.props().linkGroups;

    expect(sidemenyLinkGroups[0].label).toBe("FRA REGISTER OG BRUKER");
    expect(sidemenyLinkGroups[0].links).toHaveLength(2);
    expect(sidemenyLinkGroups[0].links[0].label).toBe("Person");
    expect(sidemenyLinkGroups[0].links[1].label).toBe("Familieforhold");

    expect(sidemenyLinkGroups[1].label).toBe("FRA REGISTER");
    expect(sidemenyLinkGroups[1].links).toHaveLength(2);
    expect(sidemenyLinkGroups[1].links[0].label).toBe("Medlemskap");
    expect(sidemenyLinkGroups[1].links[1].label).toBe("Arbeidsforhold og inntekt");

    expect(sidemenyLinkGroups[2].label).toBe("FRA BRUKER");
    expect(sidemenyLinkGroups[2].links).toHaveLength(4);
    expect(sidemenyLinkGroups[2].links[0].label).toBe("Arbeidsgiver/virksomhet");
    expect(sidemenyLinkGroups[2].links[1].label).toBe("Fullmektig");
    expect(sidemenyLinkGroups[2].links[2].label).toBe("Periode og land");
    expect(sidemenyLinkGroups[2].links[3].label).toBe("Arbeidssted(er)");
  });

  it("Viser korrekte menypunkter for altinn-søknad", () => {
    props.behandlingstema = UTSENDT_ARBEIDSTAKER;
    props.mottatteOpplysningerType = SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS;
    const menypanel = shallow(<Menypanel {...props} />);
    const sidemeny = menypanel.find(Sidemeny);
    const sidemenyLinkGroups = sidemeny.props().linkGroups;

    expect(sidemenyLinkGroups[0].label).toBe("FRA REGISTER OG BRUKER");
    expect(sidemenyLinkGroups[0].links).toHaveLength(2);
    expect(sidemenyLinkGroups[0].links[0].label).toBe("Person");
    expect(sidemenyLinkGroups[0].links[1].label).toBe("Familieforhold");

    expect(sidemenyLinkGroups[1].label).toBe("FRA REGISTER");
    expect(sidemenyLinkGroups[1].links).toHaveLength(2);
    expect(sidemenyLinkGroups[1].links[0].label).toBe("Medlemskap");
    expect(sidemenyLinkGroups[1].links[1].label).toBe("Arbeidsforhold og inntekt");

    expect(sidemenyLinkGroups[2].label).toBe("FRA BRUKER");
    expect(sidemenyLinkGroups[2].links).toHaveLength(7);
    expect(sidemenyLinkGroups[2].links[0].label).toBe("Arbeidsgiver/virksomhet");
    expect(sidemenyLinkGroups[2].links[1].label).toBe("Lønn og godtgjørelser");
    expect(sidemenyLinkGroups[2].links[2].label).toBe("Fullmektig");
    expect(sidemenyLinkGroups[2].links[3].label).toBe("Utenlandsoppdraget");
    expect(sidemenyLinkGroups[2].links[4].label).toBe("Arbeidssted(er)");
    expect(sidemenyLinkGroups[2].links[5].label).toBe("Om virksomheten i Norge");
    expect(sidemenyLinkGroups[2].links[6].label).toBe("Øvrig om arbeidstaker");
  });

  each([BESLUTNING_LOVVALG_ANNET_LAND, ANMODNING_OM_UNNTAK_HOVEDREGEL]).it(
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
      expect(sidemenyLinkGroups[0].links[3].label).toBe("Arbeidsforhold og inntekt");
    }
  );

  each([IKKE_YRKESAKTIV, TRYGDETID]).it("Viser korrekte menypunkter for behandlingstema %p", (behandlingstema) => {
    props.behandlingstema = behandlingstema;
    const menypanel = shallow(<Menypanel {...props} />);
    const sidemeny = menypanel.find(Sidemeny);
    const sidemenyLinkGroups = sidemeny.props().linkGroups;

    expect(sidemenyLinkGroups[0].label).toBe(undefined);
    expect(sidemenyLinkGroups[0].links).toHaveLength(1);
    expect(sidemenyLinkGroups[0].links[0].label).toBe("Fullmektig");
  });

  each([REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING, REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE]).it(
    "Viser korrekte menypunkter for behandlingstema %p",
    (behandlingstema) => {
      props.behandlingstema = behandlingstema;
      const menypanel = shallow(<Menypanel {...props} />);
      const sidemeny = menypanel.find(Sidemeny);
      const sidemenyLinkGroups = sidemeny.props().linkGroups;

      expect(sidemenyLinkGroups[0].label).toBe("FRA REGISTER");
      expect(sidemenyLinkGroups[0].links).toHaveLength(3);
      expect(sidemenyLinkGroups[0].links[0].label).toBe("Person");
      expect(sidemenyLinkGroups[0].links[1].label).toBe("Familieforhold");
      expect(sidemenyLinkGroups[0].links[2].label).toBe("Medlemskap");
    }
  );

  each([BESLUTNING_LOVVALG_NORGE]).it("Viser korrekte menypunkter for behandlingstema %p", (behandlingstema) => {
    props.behandlingstema = behandlingstema;
    const menypanel = shallow(<Menypanel {...props} />);
    const sidemeny = menypanel.find(Sidemeny);
    const sidemenyLinkGroups = sidemeny.props().linkGroups;

    expect(sidemenyLinkGroups[0].label).toBe("FRA REGISTER OG BRUKER");
    expect(sidemenyLinkGroups[0].links).toHaveLength(2);
    expect(sidemenyLinkGroups[0].links[0].label).toBe("Person");
    expect(sidemenyLinkGroups[0].links[1].label).toBe("Familieforhold");

    expect(sidemenyLinkGroups[1].label).toBe("FRA REGISTER");
    expect(sidemenyLinkGroups[1].links).toHaveLength(2);
    expect(sidemenyLinkGroups[1].links[0].label).toBe("Medlemskap");
    expect(sidemenyLinkGroups[1].links[1].label).toBe("Arbeidsforhold og inntekt");

    expect(sidemenyLinkGroups[2].label).toBe("FRA BRUKER");
    expect(sidemenyLinkGroups[2].links).toHaveLength(4);
    expect(sidemenyLinkGroups[2].links[0].label).toBe("Arbeidsgiver/virksomhet");
    expect(sidemenyLinkGroups[2].links[1].label).toBe("Fullmektig");
    expect(sidemenyLinkGroups[2].links[2].label).toBe("Periode og land");
    expect(sidemenyLinkGroups[2].links[3].label).toBe("Arbeidssted(er)");
  });

  each([ARBEID_I_UTLANDET]).it("Viser korrekte menypunkter for behandlingstema %p", (behandlingstema) => {
    props.behandlingstema = behandlingstema;
    const menypanel = shallow(<Menypanel {...props} />);
    const sidemeny = menypanel.find(Sidemeny);
    const sidemenyLinkGroups = sidemeny.props().linkGroups;

    expect(sidemenyLinkGroups[0].label).toBe("FRA REGISTER OG BRUKER");
    expect(sidemenyLinkGroups[0].links).toHaveLength(2);
    expect(sidemenyLinkGroups[0].links[0].label).toBe("Person");
    expect(sidemenyLinkGroups[0].links[1].label).toBe("Familieforhold");

    expect(sidemenyLinkGroups[1].label).toBe("FRA REGISTER");
    expect(sidemenyLinkGroups[1].links).toHaveLength(2);
    expect(sidemenyLinkGroups[1].links[0].label).toBe("Medlemskap");
    expect(sidemenyLinkGroups[1].links[1].label).toBe("Arbeidsforhold og inntekt");

    expect(sidemenyLinkGroups[2].label).toBe("FRA BRUKER");
    expect(sidemenyLinkGroups[2].links).toHaveLength(2);
    expect(sidemenyLinkGroups[2].links[0].label).toBe("Arbeidsgiver/virksomhet");
    expect(sidemenyLinkGroups[2].links[1].label).toBe("Fullmektig");
  });

  each([behandlingstyper.KLAGE, behandlingstyper.HENVENDELSE]).it(
    "Viser korrekte menypunkter for behandlingstype %p",
    (behandlingstype) => {
      props.behandlingstype = behandlingstype;
      const menypanel = shallow(<Menypanel {...props} />);
      const sidemeny = menypanel.find(Sidemeny);
      const sidemenyLinkGroups = sidemeny.props().linkGroups;

      expect(sidemenyLinkGroups[0].label).toBe(undefined);
      expect(sidemenyLinkGroups[0].links).toHaveLength(1);
      expect(sidemenyLinkGroups[0].links[0].label).toBe("Fullmektig");
    }
  );

  it("hvis mottatteOpplysningerType er SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS vises arbeidsforholdrolleetiketter", () => {
    props.mottatteOpplysningerType = SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS;
    const menypanel = shallow(<Menypanel {...props} />);
    const activeContent = menypanel.find(Nav.Panel);

    expect(activeContent.children().props().visArbeidsforholdRolleEtiketter).toBe(true);
  });

  each([SØKNAD_A1_YRKESAKTIVE_EØS, SED, SØKNAD_FOLKETRYGDEN]).it(
    "viser ikke arbeidsforholdrolleetiketter hvis mottatteOpplysningerType er %p",
    (mottatteOpplysningerType) => {
      props.mottatteOpplysningerType = mottatteOpplysningerType;
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
  ]).it(`viser ikke mottatteOpplysningerdata hvis behandlingstema er %p`, (behandlingstema) => {
    props.behandlingstype = MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG;
    props.sakstype = MKV.Koder.sakstyper.EU_EOS;
    props.behandlingstema = behandlingstema;
    const menypanel = shallow(<Menypanel {...props} />);
    const activeContent = menypanel.find(Nav.Panel);

    expect(activeContent.children().props().visMottatteOpplysningerData).toBe(false);
  });

  it("viser mottatteOpplysningerdata hvis behandlingstema er BESLUTNING_LOVVALG_NORGE", () => {
    props.behandlingstype = MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG;
    props.mottatteOpplysningerType = SØKNAD_A1_UTSENDTE_ARBEIDSTAKERE_EØS;
    props.sakstype = MKV.Koder.sakstyper.EU_EOS;
    props.behandlingstema = BESLUTNING_LOVVALG_NORGE;
    const menypanel = shallow(<Menypanel {...props} />);
    const activeContent = menypanel.find(Nav.Panel);

    expect(activeContent.children().props().visMottatteOpplysningerData).toBe(true);
  });
});
