import React from 'react';
import { FieldArray } from 'redux-form';

import * as Mui from '../../ui';
import * as Nav from '../../../utils/navFrontend';

import MKV from '../../../melosyskodeverk';

import { VurderingInngang, Varsler } from './vurderingInngang';
import SoknadslandListe from './inngang/soknadslandListe';

describe('Varsler', () => {
  let props = null;

  beforeEach(() => {
    props = {
      oppfyllerInngangsvilkar: true,
      inngangsvilkaarBegrunnelser: [],
    };
  });

  it('Viser melding om oppfyllte inngangsvilkår', () => {
    const varsler = shallow(<Varsler {...props} />);
    const lis = varsler.find('li');

    expect(lis).toHaveLength(2);
    expect(lis.first().text()).toBe('Søknaden oppfyller inngangsvilkårene for EU/EØS-saker etter forordning 883/2004.');
    expect(lis.last().text()).toBe('Sjekk eventuelt at området dekkes av forordningen.');
  });

  it('Viser feilmelding ved ikke oppfylte inngangsvilkår', () => {
    props.oppfyllerInngangsvilkar = false;
    props.inngangsvilkaarBegrunnelser = [
      MKV.Koder.begrunnelser.inngangsvilkaar.MANGLER_STATSBORGERSKAP,
      MKV.Koder.begrunnelser.inngangsvilkaar.TEKNISK_FEIL,
    ];
    const varsler = shallow(<Varsler {...props} />);
    const lis = varsler.find('li');

    expect(lis).toHaveLength(3);
    expect(lis.first().text()).toBe('Søknaden oppfyller ikke inngangsvilkårene for EU/EØS-saker etter forordning 883/2004.');
    expect(lis.at(1).text()).toBe(MKV.Terms.begrunnelser.inngangsvilkaar.MANGLER_STATSBORGERSKAP);
    expect(lis.last().text()).toBe(MKV.Terms.begrunnelser.inngangsvilkaar.TEKNISK_FEIL);
  });
});


describe('VurderingInngang', () => {
  let props = null;

  beforeEach(() => {
    props = {
      bekreftOgFortsett: jest.fn(),
      avklartefakta: [],
      alleLandkoder: [],
      begrunnelser: {
        opphold: [],
      },
      tilstand: {
        harAvklaring: true,
      },
      redigerbart: true,
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
      sakstype: MKV.Koder.sakstyper.EU_EOS,
      inngangsvilkaar: {
        vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
        oppfylt: true,
        begrunnelseKoder: [],
        begrunnelseFritekst: 'Begrunnelse',
      },
      oppfyllerInngangsvilkar: true,
    };
  });

  it('viser varsler for inngangsvilkår', () => {
    const vurderingInngang = shallow(<VurderingInngang {...props} />);
    const varsler = vurderingInngang.find(Varsler);
    const varslerProps = varsler.props();

    expect(varsler).toHaveLength(1);
    expect(varslerProps.oppfyllerInngangsvilkar).toBe(props.oppfyllerInngangsvilkar);
    expect(varslerProps.inngangsvilkaarBegrunnelser).toBe(props.inngangsvilkaar.begrunnelseKoder);
  });

  it('viser en fieldarray for søknadsland', () => {
    const vurderingInngang = shallow(<VurderingInngang {...props} />);
    const fieldArray = vurderingInngang.find(FieldArray);
    const fieldarrayProps = fieldArray.props();

    expect(fieldarrayProps.component).toBe(SoknadslandListe);
    expect(fieldarrayProps.avklartefakta).toBe(props.avklartefakta);
    expect(fieldarrayProps.soknadslandBegrunnelser).toBe(props.begrunnelser.opphold);
    expect(fieldarrayProps.alleLandkoder).toBe(props.alleLandkoder);
    expect(fieldarrayProps.redigerbart).toBe(props.redigerbart);
    expect(fieldarrayProps.oppdaterData).toBe(props.oppdaterData);
  });

  it('viser knapp for å gå videre i stegvelger', () => {
    const vurderingInngang = shallow(<VurderingInngang {...props} />);
    const bekreftOgFortsettKnapp = vurderingInngang.find(Nav.Knapp);

    expect(bekreftOgFortsettKnapp).toHaveLength(1);
    expect(bekreftOgFortsettKnapp.props().onClick).toBe(props.bekreftOgFortsett);
  });

  describe('knapp for å gå videre i stegvelger', () => {
    it('er ikke disabled dersom redigerbart og harAvklaring er true', () => {
      const vurderingInngang = shallow(<VurderingInngang {...props} />);
      const bekreftOgFortsettKnapp = vurderingInngang.find(Nav.Knapp);

      expect(bekreftOgFortsettKnapp.props().disabled).toBe(false);
    });

    it('er disabled dersom redigerbart er false', () => {
      props.redigerbart = false;
      const vurderingInngang = shallow(<VurderingInngang {...props} />);
      const bekreftOgFortsettKnapp = vurderingInngang.find(Nav.Knapp);

      expect(bekreftOgFortsettKnapp.props().disabled).toBe(true);
    });

    it('er disabled dersom harAvklaring er false', () => {
      props.tilstand.harAvklaring = false;
      const vurderingInngang = shallow(<VurderingInngang {...props} />);
      const bekreftOgFortsettKnapp = vurderingInngang.find(Nav.Knapp);

      expect(bekreftOgFortsettKnapp.props().disabled).toBe(true);
    });
  });
});
