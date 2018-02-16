/* eslint-disable */

import Logikk from './stegLogikk';

import { VurderingSysselsettingTyper } from '../vurderinger/vurderingSysselsetting';

it('treffer riktig stivalg FRA PERIODE med valg (ANYTHING)', () => {
  const gjeldendeSteg = 'PERIODE';
  const saksbehandlersVurdering = { sysselsettingType: VurderingSysselsettingTyper.ARBEIDSTAKER };

  expect(Logikk.beregnNesteSteg(gjeldendeSteg, saksbehandlersVurdering)).toEqual('SYSSELSETTING');
});
