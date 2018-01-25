/* eslint-disable */

import TilstandsLogikk from './tilstandsLogikk';

it('returnerer et objekt', () => {

  const retur = TilstandsLogikk.beregnTilstand('STEG', {});
  expect(typeof retur).toBe('object');
});
