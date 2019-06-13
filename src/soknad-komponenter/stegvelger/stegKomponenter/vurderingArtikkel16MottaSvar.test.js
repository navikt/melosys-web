import React from 'react';

import { VurderingArtikkel16MottaSvar } from './vurderingArtikkel16MottaSvar';
import { DatoOmradeMedVarighet } from '../../../komponenter/datoOmrade/datoOmrade';

describe('VurderingArtikkel16MottaSvar', () => {
  let props = null;

  beforeEach(() => {
    props = {
      bekreftOgFortsett: jest.fn(),
      gyldigeSoknadsland: [],
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
      tilstand: {
        svarAnmodningUnntakAvklartfakta: {
          referanse: 'felt',
          subjektID: 'subjektID',
          fakta: ['fakta'],
          begrunnelseKoder: ['begrunnelse'],
          begrunnelseFritekst: 'fritekst',
        },
      },
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

  it('viser en textarea', () => {
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16MottaSvar {...props} />);

    expect(vurderingArtikkel16Vedtak.find('Textarea')).toHaveLength(1);
    expect(vurderingArtikkel16Vedtak.find('Textarea').props().value).toBe(props.tilstand.svarAnmodningUnntakAvklartfakta.begrunnelseFritekst);
  });

  it('viser en knapp', () => {
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16MottaSvar {...props} />);

    expect(vurderingArtikkel16Vedtak.find('Knapp')).toHaveLength(1);
    vurderingArtikkel16Vedtak.find('Knapp').simulate('click');
    expect(props.bekreftOgFortsett).toHaveBeenCalledTimes(1);
  });
});
