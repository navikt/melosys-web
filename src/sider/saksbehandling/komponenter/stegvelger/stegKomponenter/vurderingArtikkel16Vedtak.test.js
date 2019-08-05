import React from 'react';
import * as MKV from 'melosys-kodeverk';

import * as Nav from '../../../../../utils/navFrontend';

import { VurderingArtikkel16Vedtak } from './vurderingArtikkel16Vedtak';
import { DatoOmradeMedVarighet } from '../../../../../felleskomponenter/datoOmrade/datoOmrade';

describe('VurderingArtikkel16Vedtak', () => {
  let props = null;

  beforeEach(() => {
    props = {
      anmodningsperiodesvar: {
        anmodningsperiodeSvarType: MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE,
        endretPeriode: { fom: 'datofom', tom: 'datotom' },
        begrunnelseFritekst: 'fritekst',
      },
      behandlingID: 1,
      lagreOgFatteVedtak: jest.fn(),
      redigerbart: true,
      lovvalgsperiode: { fom: 'datofom', tom: 'datotom' },
    };
  });

  it('viser ett Datoomrademedvarighet ved delvis innvilgelse', () => {
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16Vedtak {...props} />);

    expect(vurderingArtikkel16Vedtak.find(DatoOmradeMedVarighet)).toHaveLength(1);
    expect(vurderingArtikkel16Vedtak.find(DatoOmradeMedVarighet).props().periode).toBe(props.anmodningsperiodesvar.endretPeriode);
  });

  it('viser ikke et Datoomrademedvarighet ved avslag', () => {
    props.anmodningsperiodesvar.anmodningsperiodeSvarType = MKV.Koder.anmodningsperiodesvartyper.AVSLAG;
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16Vedtak {...props} />);

    expect(vurderingArtikkel16Vedtak.find(DatoOmradeMedVarighet)).toHaveLength(0);
  });

  it('viser en nav textarea ved delvis innvilgelse', () => {
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16Vedtak {...props} />);

    expect(vurderingArtikkel16Vedtak.find(Nav.Textarea)).toHaveLength(1);
  });

  it('viser ikke en nav textarea ved innvilgelse', () => {
    props.anmodningsperiodesvar.anmodningsperiodeSvarType = MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE;
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16Vedtak {...props} />);

    expect(vurderingArtikkel16Vedtak.find(Nav.Textarea)).toHaveLength(0);
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
