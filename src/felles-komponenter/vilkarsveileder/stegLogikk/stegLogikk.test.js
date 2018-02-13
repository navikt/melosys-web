/* eslint-disable */

import Logikk from './stegLogikk';

import { VurderingSysselsettingTyper } from '../vurderinger/vurderingSysselsetting';

it('treffer riktig stivalg FRA PERIODE med valg (ANYTHING)', () => {
  const gjeldendeSteg = 'PERIODE';
  const saksbehandlersVurdering = { sysselsettingType: VurderingSysselsettingTyper.ARBEIDSTAKER };

  expect(Logikk.beregnNesteSteg(gjeldendeSteg, saksbehandlersVurdering)).toEqual('SYSSELSETTING');
});

it('treffer riktig stivalg FRA SYSSELSETTING med valg SEKTOR', () => {
  const gjeldendeSteg = 'SYSSELSETTING';
  const saksbehandlersVurdering = { sysselsettingType: VurderingSysselsettingTyper.SELVSTENDIG };

  expect(Logikk.beregnNesteSteg(gjeldendeSteg, saksbehandlersVurdering)).toEqual('VIRKSOMHET');
});

it('treffer riktig stivalg FRA SYSSELSETTING med valg ARBEIDSTAKER', () => {
  const gjeldendeSteg = 'SYSSELSETTING';
  const saksbehandlersVurdering = { sysselsettingType: VurderingSysselsettingTyper.ARBEIDSTAKER };

  expect(Logikk.beregnNesteSteg(gjeldendeSteg, saksbehandlersVurdering)).toEqual('ARBEIDSFORHOLD');
});
