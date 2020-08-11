import React from 'react';
import * as EKV from 'eessi-kodeverk';

import { VurderingArbeidEttLandOvrigVedtak } from './vurderingArbeidEttLandOvrigVedtak';
import Mottakerinstitusjonvelger, { MottakerinstitusjonvelgerFlervalg } from '../../mottakerinstitusjonvelger';
import PdfLenkeListe from '../../pdfLenkeListe';

import * as KV from '../../../kodeverk';
import * as Skjema from '../../skjema';

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
      behandlingsgrunnlagFom: '',
      behandlingsgrunnlagTom: '',
      soknadsperiode: { tom: '', fom: '' },
    };
  });

  describe('ved art11_5', () => {
    beforeEach(() => {
      props.formValues.lovvalgsbestemmelse = MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5;
    });

    describe('viser nødvendige felter dersom', () => {
      it('man velger å informere utenlandsk trygdemyndighet', () => {
        props.formValues.informerUtenlandskTrygdemyndighet = true;
        props.formValues.kreverMottakerinstitusjon = true;
        props.formValues.mottakerLand = MKV.Koder.landkoder.DE;

        const vurderingArbeidEttLandOvrigVedtak = shallow(<VurderingArbeidEttLandOvrigVedtak {...props} />);

        const mottakerinstitusjoner = vurderingArbeidEttLandOvrigVedtak.find(Mottakerinstitusjonvelger);
        const ytterligereInformasjon = vurderingArbeidEttLandOvrigVedtak.findWhere(n =>
          n.type() === Skjema.Textarea &&
          n.props().label === 'Ytterligere informasjon til SED (valgfri)');
        const pdfLenkeListe = vurderingArbeidEttLandOvrigVedtak.find(PdfLenkeListe);

        expect(mottakerinstitusjoner).toHaveLength(1);
        expect(ytterligereInformasjon).toHaveLength(1);
        expect(pdfLenkeListe.props().dokumenter).toEqual(expect.arrayContaining([
          expect.objectContaining({
            type: EKV.Koder.sedtyper.A010,
          }),
        ]));
      });
    });

    describe('gjemmer unødvendige felter dersom', () => {
      it('man velger å informere utenlandsk trygdemyndighet, men ingen mottakerinstitusjoner finnes for valgt land', () => {
        props.formValues.informerUtenlandskTrygdemyndighet = true;
        props.formValues.kreverMottakerinstitusjon = false;
        const vurderingArbeidEttLandOvrigVedtak = shallow(<VurderingArbeidEttLandOvrigVedtak {...props} />);

        const mottakerinstitusjoner = vurderingArbeidEttLandOvrigVedtak.find(Mottakerinstitusjonvelger);
        const ytterligereInformasjon = vurderingArbeidEttLandOvrigVedtak.findWhere(n =>
          n.type() === Skjema.Textarea &&
          n.props().label === 'Ytterligere informasjon til SED (valgfri)');
        const pdfLenkeListe = vurderingArbeidEttLandOvrigVedtak.find(PdfLenkeListe);

        expect(mottakerinstitusjoner).toHaveLength(0);
        expect(ytterligereInformasjon).toHaveLength(0);
        expect(pdfLenkeListe.props().dokumenter).not.toEqual(expect.arrayContaining([
          expect.objectContaining({
            type: EKV.Koder.sedtyper.A010,
          }),
        ]));
      });

      it('man velger å ikke informere utenlandsk trygdemyndighet', () => {
        props.formValues.informerUtenlandskTrygdemyndighet = false;
        const vurderingArbeidEttLandOvrigVedtak = shallow(<VurderingArbeidEttLandOvrigVedtak {...props} />);

        const mottakerinstitusjoner = vurderingArbeidEttLandOvrigVedtak.find(Mottakerinstitusjonvelger);
        const ytterligereInformasjon = vurderingArbeidEttLandOvrigVedtak.findWhere(n =>
          n.type() === Skjema.Textarea &&
          n.props().label === 'Ytterligere informasjon til SED (valgfri)');
        const pdfLenkeListe = vurderingArbeidEttLandOvrigVedtak.find(PdfLenkeListe);

        expect(mottakerinstitusjoner).toHaveLength(0);
        expect(ytterligereInformasjon).toHaveLength(0);
        expect(pdfLenkeListe.props().dokumenter).not.toEqual(expect.arrayContaining([
          expect.objectContaining({
            type: EKV.Koder.sedtyper.A010,
          }),
        ]));
      });
    });
  });
});
