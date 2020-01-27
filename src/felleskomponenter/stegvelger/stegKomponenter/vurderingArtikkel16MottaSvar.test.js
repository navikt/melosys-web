import React from 'react';
import MKV from '../../../melosyskodeverk';

import { VurderingArtikkel16MottaSvar } from './vurderingArtikkel16MottaSvar';
import { DatoOmradeMedVarighet } from '../../datoOmrade/datoOmrade';

describe('VurderingArtikkel16MottaSvar', () => {
  let props = null;

  beforeEach(() => {
    props = {
      bekreftOgFortsett: jest.fn(),
      gyldigeSoknadsland: [],
      anmodningsperiodeSvarType: MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE,
      soknadsperiode: {
        periode: {
          fom: 'fomdato',
          tom: 'tomdato',
        },
      },
      redigerbart: true,
      lovvalgsperiodeFom: 'lovfom',
      lovvalgsperiodeTom: 'lovtom',
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
      hentAnmodningsperiodeSvar: jest.fn(),
      sendAnmodningsperiodeSvar: jest.fn(),
      tilstand: {},
    };
  });

  it('vises uten å krasje', () => {
    shallow(<VurderingArtikkel16MottaSvar {...props} />);
  });

  it('viser ett Datoomrademedvarighet', () => {
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16MottaSvar {...props} />);

    expect(vurderingArtikkel16Vedtak.find(DatoOmradeMedVarighet)).toHaveLength(1);
    expect(vurderingArtikkel16Vedtak.find(DatoOmradeMedVarighet).props().periode).toBe(props.soknadsperiode);
  });

  it('viser en textarea ved delvis innvilgelse', () => {
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16MottaSvar {...props} />);

    expect(vurderingArtikkel16Vedtak.find('Textarea')).toHaveLength(1);
  });

  it('viser en knapp', () => {
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16MottaSvar {...props} />);

    expect(vurderingArtikkel16Vedtak.find('Knapp')).toHaveLength(1);
    vurderingArtikkel16Vedtak.find('Knapp').simulate('click');
    expect(props.bekreftOgFortsett).toHaveBeenCalledTimes(1);
  });
});
