import React, { ComponentProps, MouseEvent } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import * as Nav from "../../../navFrontend";
import * as Mui from "../../../felleskomponenter/ui";

import MKV from "../../../melosyskodeverk";

import { VurderingInngang, Varsler } from "./vurderingInngang";

describe("Varsler", () => {
  const mockedProps = mock<ComponentProps<typeof Varsler>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.landkoder = ["DK"];
  });

  it("Viser melding om oppfyllte inngangsvilkår", () => {
    props.oppfyllerInngangsvilkar = true;
    props.inngangsvilkaar = {
      vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
      oppfylt: true,
      begrunnelseKoder: [],
      begrunnelseFritekst: null,
      begrunnelseFritekstEngelsk: null,
    };

    const varsler = shallow(<Varsler {...props} />);
    const lis = varsler.find("li");

    expect(lis).toHaveLength(1);
    expect(lis.first().text()).toBe("Søknaden oppfyller inngangsvilkårene for EU/EØS-saker etter forordning 883/2004.");
  });

  it("Viser feilmelding og hjelpetekst ved ikke oppfylte inngangsvilkår", () => {
    props.oppfyllerInngangsvilkar = false;
    props.inngangsvilkaar = {
      ...props.inngangsvilkaar,
      vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
      oppfylt: true,
      begrunnelseFritekst: null,
      begrunnelseFritekstEngelsk: null,
      begrunnelseKoder: [
        MKV.Koder.begrunnelser.inngangsvilkaar.MANGLER_STATSBORGERSKAP,
        MKV.Koder.begrunnelser.inngangsvilkaar.TEKNISK_FEIL,
      ],
    };
    const varsler = shallow(<Varsler {...props} />);
    const feilmeldingsliste = varsler.find("ul").first();
    const lis = feilmeldingsliste.find("li");
    const hjelpetekstalertstripe = varsler.find(Nav.AlertStripe);

    expect(lis).toHaveLength(3);
    expect(lis.first().text()).toBe(
      "Søknaden oppfyller ikke inngangsvilkårene for EU/EØS-saker etter forordning 883/2004."
    );
    expect(lis.at(1).text()).toBe(MKV.Terms.begrunnelser.inngangsvilkaar.MANGLER_STATSBORGERSKAP);
    expect(lis.last().text()).toBe(MKV.Terms.begrunnelser.inngangsvilkaar.TEKNISK_FEIL);
    expect(hjelpetekstalertstripe).toHaveLength(1);
  });

  it("Viser feilmelding og hjelpetekst ved overstyrte inngangsvilkår", () => {
    props.oppfyllerInngangsvilkar = true;
    props.inngangsvilkaar = {
      ...props.inngangsvilkaar,
      vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
      oppfylt: true,
      begrunnelseFritekst: null,
      begrunnelseFritekstEngelsk: null,
      begrunnelseKoder: [
        MKV.Koder.begrunnelser.inngangsvilkaar.TEKNISK_FEIL,
        MKV.Koder.begrunnelser.inngangsvilkaar.OVERSTYRT_AV_SAKSBEHANDLER,
      ],
    };

    const varsler = shallow(<Varsler {...props} />);
    const feilmeldingsliste = varsler.find("ul").first();
    const lis = feilmeldingsliste.find("li");
    const hjelpetekstalertstripe = varsler.find(Nav.AlertStripe);

    expect(lis).toHaveLength(2);
    expect(lis.first().text()).toBe(
      "Søknaden oppfyller ikke inngangsvilkårene for EU/EØS-saker etter forordning 883/2004."
    );
    expect(lis.last().text()).toBe(MKV.Terms.begrunnelser.inngangsvilkaar.TEKNISK_FEIL);
    expect(hjelpetekstalertstripe).toHaveLength(1);
  });

  it("Viser feilmelding ved manglende inngangsvilkår", () => {
    props.inngangsvilkaar = undefined;

    const varsler = shallow(<Varsler {...props} />);
    const lis = varsler.find("li");

    expect(lis).toHaveLength(1);
    expect(lis.first().text()).toBe("Teknisk feil, finner ingen inngangsvilkår.");
  });

  it("Viser feilmelding ved flere valgte land og ikke tema ARBEID_FLERE_LAND", () => {
    props.oppfyllerInngangsvilkar = true;
    props.inngangsvilkaar = {
      vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
      oppfylt: true,
      begrunnelseKoder: [],
      begrunnelseFritekst: null,
      begrunnelseFritekstEngelsk: null,
    };
    props.behandlingstema = MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER;
    props.landkoder = ["DK", "SE"];

    const varsler = shallow(<Varsler {...props} />);
    const advarsel = varsler.find(Nav.AlertStripeAdvarsel);

    expect(advarsel).toHaveLength(1);
    expect(advarsel.childAt(0).text()).toBe(
      "Du har valgt et behandlingstema som kun tillater ett arbeidsland. Du må fjerne arbeidsland, eller endre behandlingstema for å kunne fatte vedtak."
    );
  });
});

describe("VurderingInngang", () => {
  const mockedProps = mock<ComponentProps<typeof VurderingInngang>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = {
      bekreftOgFortsett: jest.fn(),
      redigerbart: true,
      inngangsvilkaar: {
        vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
        oppfylt: true,
        begrunnelseKoder: [],
        begrunnelseFritekst: "Begrunnelse",
        begrunnelseFritekstEngelsk: null,
      },
      oppfyllerInngangsvilkar: true,
      behandlingID: 1,
      hentVilkar: jest.fn(),
      landkoder: ["DK"],
      behandlingstema: MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND.kode,
    };
  });

  it("viser Varsler-komponent", () => {
    const vurderingInngang = shallow(<VurderingInngang {...props} />);
    const varsler = vurderingInngang.find(Varsler);
    const varslerProps = varsler.props();

    expect(varsler).toHaveLength(1);
    expect(varslerProps.oppfyllerInngangsvilkar).toBe(props.oppfyllerInngangsvilkar);
    expect(varslerProps.inngangsvilkaar).toBe(props.inngangsvilkaar);
  });

  it("viser knapp for å gå videre i stegvelger", () => {
    const vurderingInngang = shallow(<VurderingInngang {...props} />);
    const stegKnapper = vurderingInngang.find(Mui.StegKnapper);

    expect(stegKnapper).toHaveLength(1);

    const bekreftKnappOnClick = stegKnapper.props().bekreftKnappProps.onClick;
    const mockedMouseEvent = mock<MouseEvent<HTMLButtonElement>>();
    const mouseEvent = instance(mockedMouseEvent);
    if (bekreftKnappOnClick) {
      bekreftKnappOnClick(mouseEvent);
    }

    expect(props.bekreftOgFortsett).toHaveBeenCalledTimes(1);
  });

  describe("knapp for å gå videre i stegvelger", () => {
    it("er ikke disabled dersom redigerbart er true", () => {
      const vurderingInngang = shallow(<VurderingInngang {...props} />);
      const stegKnapper = vurderingInngang.find(Mui.StegKnapper);

      expect(stegKnapper.props().bekreftKnappProps.disabled).toBe(false);
    });

    it("er disabled dersom redigerbart er false", () => {
      props.redigerbart = false;
      const vurderingInngang = shallow(<VurderingInngang {...props} />);
      const stegKnapper = vurderingInngang.find(Mui.StegKnapper);

      expect(stegKnapper.props().bekreftKnappProps.disabled).toBe(true);
    });
  });
});
