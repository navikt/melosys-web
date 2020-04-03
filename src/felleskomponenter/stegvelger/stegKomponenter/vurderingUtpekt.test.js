import React from 'react';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';

import RegisterKontrollTreff from '../../registerkontrollTreff';
import { VurderingUtpekt } from './vurderingUtpekt';

describe('VurderingUtpekt', () => {
  let props = null;

  beforeEach(() => {
    props = {
      vurderingBegrunnelser: ['Begrunnelse'],
      slettData: jest.fn(),
      bekreftOgFortsett: jest.fn(),
      redigerbart: true,
      tilstand: {
        harAvklaring: true,
        utpekingGodkjentFakta: {
          referanse: 'referanse',
          subjektID: 'referanse',
          fakta: ['fakta'],
          begrunnelseKoder: ['kode'],
          begrunnelseFritekst: 'fritekst',
        },
        lovvalgsbestemmelse: 'Lovvalgsbestemmelse',
        utpekingGodkjent: false,
        utpekingIkkeGodkjent: false,
      },
      oppdaterData: jest.fn(),
      handleSubmit: jest.fn(),
      formValues: {},
      lovvalgsperiode: { fom: '', tom: '' },
    };
  });

  it('viser advarsler fra kontroller', () => {
    const vurderingUtpekt = shallow(<VurderingUtpekt {...props} />);
    const registerKontrollTreff = vurderingUtpekt.find(RegisterKontrollTreff);

    expect(registerKontrollTreff).toHaveLength(1);
    expect(registerKontrollTreff.props().vurderingBegrunnelser).toEqual(props.vurderingBegrunnelser);
  });

  it('viser artikkelen Norge er utpekt etter', () => {
    const vurderingUtpekt = shallow(<VurderingUtpekt {...props} />);
    const select = vurderingUtpekt.find(Skjema.Select);

    expect(select).toHaveLength(1);
  });

  it('viser lovvalgsperioden Norge er utpekt for', () => {
    const vurderingUtpekt = shallow(<VurderingUtpekt {...props} />);
    const inputs = vurderingUtpekt.find(Skjema.Input);

    expect(inputs).toHaveLength(2);
  });

  it('viser radiobuttons for godkjenning og avslag', () => {
    props.tilstand.utpekingGodkjent = true;
    const vurderingUtpekt = shallow(<VurderingUtpekt {...props} />);
    const radios = vurderingUtpekt.find(Nav.Radio);

    expect(radios).toHaveLength(2);
    expect(radios.first().props().checked).toBe(true);
  });

  it('viser en form som tar handleSubmit som onSubmit-prop', () => {
    const vurderingAvslaaUtpeking = shallow(<VurderingUtpekt {...props} />);
    const form = vurderingAvslaaUtpeking.find('form');

    expect(form.props().onSubmit).toBe(props.handleSubmit);
  });
});
