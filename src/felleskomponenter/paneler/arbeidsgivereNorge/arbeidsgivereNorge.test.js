import React from 'react';

import * as Nav from '../../../utils/navFrontend';
import * as Mui from '../../../felleskomponenter/ui';

import { ArbeidsgivereNorge, ArbeidsgivereEnkeltNorge } from './arbeidsgivereNorge';

import Organisasjon from '../arbeidsgiver/organisasjon';
import Arbeidsforholdene from '../arbeidsgiver/arbeidsforhold';
import Inntekt from '../arbeidsgiver/inntekt';

describe('ArbeidsgivereNorge', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      arbeidsgivereNorge: [
        {
          organisasjon: {},
          arbeidsforhold: [],
          inntektListe: [],
          arbeidsforholdene: [],
        },
      ],
    };
  });

  it('viser et ekspanderbartpanel', () => {
    const arbeidsgivereNorge = shallow(<ArbeidsgivereNorge {...props} />);

    expect(arbeidsgivereNorge.find(Nav.EkspanderbartpanelBase)).toHaveLength(1);
  });


  it('lister ut alle arbeidsgivere i Norge', () => {
    const arbeidsgivereNorge = shallow(<ArbeidsgivereNorge {...props} />);
    const arbeidsgivereNorgeListe = arbeidsgivereNorge.find(ArbeidsgivereEnkeltNorge);

    expect(arbeidsgivereNorgeListe).toHaveLength(1);
    expect(arbeidsgivereNorgeListe.first().props().organisasjon).toBe(props.arbeidsgivereNorge[0].organisasjon);
    expect(arbeidsgivereNorgeListe.first().props().arbeidsforhold).toBe(props.arbeidsgivereNorge[0].arbeidsforhold);
    expect(arbeidsgivereNorgeListe.first().props().inntektListe).toBe(props.arbeidsgivereNorge[0].inntektListe);
  });

  it('wrapper ikke arbeidsgiver i panel ved 1 arbeidsgiver', () => {
    const arbeidsgivereNorge = shallow(<ArbeidsgivereNorge {...props} />);
    const arbeidsgivereNorgeListe = arbeidsgivereNorge.find(ArbeidsgivereEnkeltNorge);

    expect(arbeidsgivereNorgeListe.first().props().wrapIPanel).toBe(false);
  });

  it('wrapper arbeidsgiver i panel ved 2 arbeidsgivere', () => {
    props.arbeidsgivereNorge = [
      ...props.arbeidsgivereNorge,
      ...props.arbeidsgivereNorge,
    ];
    const arbeidsgivereNorge = shallow(<ArbeidsgivereNorge {...props} />);
    const arbeidsgivereNorgeListe = arbeidsgivereNorge.find(ArbeidsgivereEnkeltNorge);

    expect(arbeidsgivereNorgeListe.first().props().wrapIPanel).toBe(true);
  });
});

describe('ArbeidsgivereEnkeltNorge', () => {
  let props = null;

  beforeEach(() => {
    props = {
      kilde: 'Skatteetaten',
      organisasjon: {
        navn: 'NAV Oslo',
      },
      arbeidsforholdene: [],
      inntektListe: [],
      redigerbart: true,
      wrapIPanel: false,
    };
  });

  it('viser organisasjon, arbeidsforhold og inntekt', () => {
    const arbeidsgivereEnkeltNorge = shallow(<ArbeidsgivereEnkeltNorge {...props} />);
    const organisasjon = arbeidsgivereEnkeltNorge.find(Organisasjon);
    const organisasjonProps = organisasjon.props();
    const arbeidsforholdene = arbeidsgivereEnkeltNorge.find(Arbeidsforholdene);
    const arbeidsforholdeneProps = arbeidsforholdene.props();
    const inntekt = arbeidsgivereEnkeltNorge.find(Inntekt);
    const inntektProps = inntekt.props();

    expect(organisasjon).toHaveLength(1);
    expect(organisasjonProps.organisasjon).toBe(props.organisasjon);
    expect(organisasjonProps.redigerbart).toBe(props.redigerbart);
    expect(arbeidsforholdene).toHaveLength(1);
    expect(arbeidsforholdeneProps.arbeidsforholdene).toBe(props.arbeidsforholdene);
    expect(inntekt).toHaveLength(1);
    expect(inntektProps.inntektListe).toBe(props.inntektListe);
  });

  it('kan wrappes i panel', () => {
    props.wrapIPanel = true;
    let arbeidsgivereEnkeltNorge = shallow(<ArbeidsgivereEnkeltNorge {...props} />);

    expect(arbeidsgivereEnkeltNorge.find(Mui.LesMerPanel)).toHaveLength(1);

    props.wrapIPanel = false;
    arbeidsgivereEnkeltNorge = shallow(<ArbeidsgivereEnkeltNorge {...props} />);

    expect(arbeidsgivereEnkeltNorge.find(Mui.LesMerPanel)).toHaveLength(0);
  });
});
