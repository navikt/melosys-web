import React from 'react';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../../felleskomponenter/skjema';

import MKV from '../../../melosyskodeverk';
import RegisterKontrollTreff from '../../../felleskomponenter/registerkontrollTreff';
import { VurderingNorgeUtpekt } from './vurderingNorgeUtpekt';

describe('VurderingNorgeUtpekt', () => {
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
      behandlingstype: MKV.Koder.behandlinger.behandlingstyper.BESLUTNING_LOVVALG_NORGE,
    };
  });

  it('viser advarsler fra kontroller', () => {
    const vurderingNorgeUtpekt = shallow(<VurderingNorgeUtpekt {...props} />);
    const registerKontrollTreff = vurderingNorgeUtpekt.find(RegisterKontrollTreff);

    expect(registerKontrollTreff).toHaveLength(1);
    expect(registerKontrollTreff.props().vurderingBegrunnelser).toEqual(props.vurderingBegrunnelser);
  });

  it('viser artikkelen Norge er utpekt etter', () => {
    const vurderingNorgeUtpekt = shallow(<VurderingNorgeUtpekt {...props} />);
    const select = vurderingNorgeUtpekt.find(Skjema.Select);

    expect(select).toHaveLength(1);
  });

  it('viser lovvalgsperioden Norge er utpekt for', () => {
    const vurderingNorgeUtpekt = shallow(<VurderingNorgeUtpekt {...props} />);
    const inputs = vurderingNorgeUtpekt.find(Skjema.Input);

    expect(inputs).toHaveLength(2);
  });

  it('viser radiobuttons for godkjenning og avslag', () => {
    props.tilstand.utpekingGodkjent = true;
    const vurderingNorgeUtpekt = shallow(<VurderingNorgeUtpekt {...props} />);
    const radios = vurderingNorgeUtpekt.find(Nav.Radio);

    expect(radios).toHaveLength(2);
    expect(radios.first().props().checked).toBe(true);
  });

  it('viser en form som tar handleSubmit som onSubmit-prop', () => {
    const vurderingAvslaaUtpeking = shallow(<VurderingNorgeUtpekt {...props} />);
    const form = vurderingAvslaaUtpeking.find('form');

    expect(form.props().onSubmit).toBe(props.handleSubmit);
  });
});
