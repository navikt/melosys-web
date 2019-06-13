import React from 'react';

import * as KV from '../../../kodeverk';

import { VurderingArtikkel16Vedtak } from './vurderingArtikkel16Vedtak';
import { DatoOmradeMedVarighet } from '../../../komponenter/datoOmrade/datoOmrade';

describe('VurderingArtikkel16Vedtak', () => {
  let props = null;

  beforeEach(() => {
    props = {
      behandlingID: 1,
      lagreOgFatteVedtak: jest.fn(),
      redigerbart: true,
      lovvalgsperiode: { fom: 'datofom', tom: 'datotom' },
      innvilgelsesResultat: KV.Koder.INNVILGET,
      tilstand: {
        svarAnmodningUnntakFritekst: 'Fritekst',
      },
    };
  });

  it('vises uten å krasje', () => {
    shallow(<VurderingArtikkel16Vedtak {...props} />);
  });

  it('viser ett Datoomrademedvarighet', () => {
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16Vedtak {...props} />);

    expect(vurderingArtikkel16Vedtak.find(DatoOmradeMedVarighet)).toHaveLength(1);
    expect(vurderingArtikkel16Vedtak.find(DatoOmradeMedVarighet).props().periode).toBe(props.lovvalgsperiode);
  });

  it('viser en pdflenkeliste', () => {
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16Vedtak {...props} />);

    expect(vurderingArtikkel16Vedtak.find('PdfLenkeListe')).toHaveLength(1);
    expect(vurderingArtikkel16Vedtak.find('PdfLenkeListe').props().behandlingID).toBe(props.behandlingID);
  });

  it('viser en knapp', () => {
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16Vedtak {...props} />);

    expect(vurderingArtikkel16Vedtak.find('Hovedknapp')).toHaveLength(1);
    vurderingArtikkel16Vedtak.find('Hovedknapp').simulate('click');
    expect(props.lagreOgFatteVedtak).toHaveBeenCalledTimes(1);
  });
});
