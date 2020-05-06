import React from 'react';

import * as Skjema from '../../../felleskomponenter/skjema';
import * as Mui from '../../../felleskomponenter/ui';

import { VurderingAvslaaUtpeking } from './vurderingAvslaaUtpeking';
import PdfLenkeListe from '../../../felleskomponenter/pdfLenkeListe';

describe('VurderingAvslaaUtpeking', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      behandlingID: 4,
      handleSubmit: jest.fn(),
      avvisUtpeking: jest.fn(),
      fritekst: '',
      nyttLovvalgsland: 'CZ',
      begrunnelseUtenlandskMyndighet: 'Begrunnelse',
      vilSendeAnmodningOmMerInformasjon: true,
      touchAll: jest.fn(),
      formIsValid: true,
    };
  });

  it('viser to textarea for begrunnelser', () => {
    const vurderingAvslaaUtpeking = shallow(<VurderingAvslaaUtpeking {...props} />);

    expect(vurderingAvslaaUtpeking.find(Skjema.Textarea)).toHaveLength(2);
  });

  it('viser en radiogruppe', () => {
    const vurderingAvslaaUtpeking = shallow(<VurderingAvslaaUtpeking {...props} />);

    expect(vurderingAvslaaUtpeking.find(Skjema.RadioGruppe)).toHaveLength(1);
    expect(vurderingAvslaaUtpeking.find(Skjema.Radio)).toHaveLength(2);
  });

  it('viser en landvelger', () => {
    const vurderingAvslaaUtpeking = shallow(<VurderingAvslaaUtpeking {...props} />);

    expect(vurderingAvslaaUtpeking.find(Skjema.LandVelger)).toHaveLength(1);
  });

  it('viser en pdflenkeliste', () => {
    const vurderingAvslaaUtpeking = shallow(<VurderingAvslaaUtpeking {...props} />);
    const pdfLenkeListe = vurderingAvslaaUtpeking.find(PdfLenkeListe);

    expect(pdfLenkeListe).toHaveLength(1);
    expect(pdfLenkeListe.props().behandlingID).toBe(props.behandlingID);
  });

  it('viser en knapp for å avslutte behandling', () => {
    const vurderingAvslaaUtpeking = shallow(<VurderingAvslaaUtpeking {...props} />);
    const avsluttKnapp = vurderingAvslaaUtpeking.find(Mui.Knapp);

    expect(avsluttKnapp).toHaveLength(1);
  });

  it('viser en form som tar handleSubmit som onSubmit-prop', () => {
    const vurderingAvslaaUtpeking = shallow(<VurderingAvslaaUtpeking {...props} />);
    const form = vurderingAvslaaUtpeking.find('form');

    expect(form.props().onSubmit).toBe(props.handleSubmit);
  });
});
