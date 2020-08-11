import React from 'react';

import * as Skjema from '../../skjema';

import { VurderingArtikkel13UtpekLand } from './vurderingArtikkel13UtpekLand';

/* eslint-disable react/jsx-pascal-case */
describe('VurderingArtikkel13_1_UtpekLand', () => {
  let props = null;

  beforeEach(() => {
    props = {
      tilstand: {
        overskrift: 'Omfattet av norsk lovgivning, etter artikkel 13, nr 1, b',
      },
      redigerbart: true,
      behandlingID: 3,
      lovvalgsland: 'NO',
      lagreOgUtpek: jest.fn(),
      formIsValid: true,
      touch: jest.fn(),
      form: 'Form',
      touchAll: jest.fn(),
      erOffentligArbeidUtland: true,
      harLonnetArbeidAnnetLand: true,
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
      lagreUtpekingsperioder: jest.fn(),
      formValues: {
        forkortUtpekingsperiode: true,
      },
      utpekingsperiode: {},
      byggUtpekingsperioder: jest.fn(),
      endreUtpekingsperiode: jest.fn(),
      soknadsperiode: {},
    };
  });

  it('viser fritekst for orienteringsbrev', () => {
    const vurderingArt13UtpekLand = shallow(<VurderingArtikkel13UtpekLand {...props} />);

    const fritekstOrienteringsbrevTextarea = vurderingArt13UtpekLand.findWhere(n =>
      n.type() === Skjema.Textarea &&
      n.props().label === 'Fritekst til orienteringsbrev');

    expect(fritekstOrienteringsbrevTextarea).toHaveLength(1);
    expect(fritekstOrienteringsbrevTextarea.props().disabled).toBe(false);
  });

  it('viser periodeforkorter', () => {
    const vurderingArt13UtpekLand = shallow(<VurderingArtikkel13UtpekLand {...props} />);

    const periodeforkorter = vurderingArt13UtpekLand.find(Skjema.PeriodeForkorter);
    const periodeforkorterProps = periodeforkorter.props();

    expect(periodeforkorter).toHaveLength(1);
    expect(periodeforkorterProps.redigerbart).toBe(props.redigerbart);
    expect(periodeforkorterProps.onUncheck).toBe(props.byggUtpekingsperioder);
    expect(periodeforkorterProps.forkortPeriode).toBe(props.formValues.forkortUtpekingsperiode);
  });
});
