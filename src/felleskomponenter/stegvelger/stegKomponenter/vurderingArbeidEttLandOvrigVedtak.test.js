import React from 'react';

import { VurderingArbeidEttLandOvrigVedtak } from './vurderingArbeidEttLandOvrigVedtak';

import * as KV from '../../../kodeverk';

import MKV from '../../../melosyskodeverk';

describe('VurderingArbeidEttLandOvrigVedtak', () => {
  let props = null;

  beforeEach(() => {
    props = {
      bekreftOgFortsett: jest.fn(),
      redigerbart: true,
      oppdaterData: jest.fn(),
      slettData: jest.fn(),
      arbeidsland: [],
      behandlingID: 4,
      lovvalgsperiode: {},
      lagreOgFatteVedtak: jest.fn(),
      formIsValid: true,
      formValues: {},
      touchAll: jest.fn(),
      endreLovvalgsPeriode: jest.fn(),
      byggLovvalgsperioder: jest.fn(),
      lagreLovvalgsperioder: jest.fn(),
      behandlingstype: MKV.Koder.behandlinger.behandlingstyper.SOEKNAD,
      form: KV.Form.ARBEID_ETT_LAND_OVRIG_VEDTAK,
      handleSubmit: jest.fn(),
      lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3,
      behandlingsgrunnlagFom: '',
      behandlingsgrunnlagTom: '',
    };
  });

  it('viser Arbeidsmønstersteg uten å krasje', () => {
    shallow(<VurderingArbeidEttLandOvrigVedtak {...props} />);
  });
});
