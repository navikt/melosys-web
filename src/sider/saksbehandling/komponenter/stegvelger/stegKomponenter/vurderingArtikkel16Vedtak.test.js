import React from 'react';
import * as MKV from 'melosys-kodeverk';

import { VurderingArtikkel16Vedtak, Innvilgelse, DelvisInnvilgelse, Avslag } from './vurderingArtikkel16Vedtak';

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
      anmodningsperiode: { fom: '01.01.2018', tom: '01.01.2019' },
      vilkarBegrunnelser: [],
      art_12_1_begrunnelser: [],
      art_12_2_begrunnelser: [],
    };
  });

  it('viser innvilgelse-komponent ved innvilgelse', () => {
    props.anmodningsperiodesvar.anmodningsperiodeSvarType = MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE;
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16Vedtak {...props} />);

    expect(vurderingArtikkel16Vedtak.find(Innvilgelse)).toHaveLength(1);
  });

  it('viser "delvis innvilgelse"-komponent ved delvis innvilgelse', () => {
    props.anmodningsperiodesvar.anmodningsperiodeSvarType = MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE;
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16Vedtak {...props} />);

    expect(vurderingArtikkel16Vedtak.find(DelvisInnvilgelse)).toHaveLength(1);
  });

  it('viser avslag-komponent ved avslag', () => {
    props.anmodningsperiodesvar.anmodningsperiodeSvarType = MKV.Koder.anmodningsperiodesvartyper.AVSLAG;
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16Vedtak {...props} />);

    expect(vurderingArtikkel16Vedtak.find(Avslag)).toHaveLength(1);
  });

  it('viser en knapp', () => {
    const vurderingArtikkel16Vedtak = shallow(<VurderingArtikkel16Vedtak {...props} />);

    expect(vurderingArtikkel16Vedtak.find('Hovedknapp')).toHaveLength(1);
    vurderingArtikkel16Vedtak.find('Hovedknapp').simulate('click');
    expect(props.lagreOgFatteVedtak).toHaveBeenCalledTimes(1);
  });
});
