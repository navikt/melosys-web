/* eslint-disable */

import Logikk from './stegLogikk';

import VurderingSysselsetting from '../vurderinger/vurderingSysselsetting';

it('treffer riktig stivalg FRA SYSSELSETTING med valg ARBEIDSTAKER', () => {
  const gjeldendeSteg = 'SYSSELSETTING';
  const saksbehandlersVurdering = VurderingSysselsetting.ARBEIDSTAKER;

  expect(Logikk.beregnNesteSteg(gjeldendeSteg, saksbehandlersVurdering)).toEqual('SEKTOR');
});

it('treffer riktig stivalg FRA SYSSELSETTING med valg SELVSTENDIG', () => {
  const gjeldendeSteg = 'SYSSELSETTING';
  const saksbehandlersVurdering = VurderingSysselsetting.SELVSTENDIG;

  expect(Logikk.beregnNesteSteg(gjeldendeSteg, saksbehandlersVurdering)).toEqual('VIRKSOMHET');
});
