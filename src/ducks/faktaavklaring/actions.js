/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

import * as Types from './types';

/* eslint-disable import/prefer-default-export */
export function oppdaterFaktaavklaringState(dokument) {
  return ({
    type: Types.OPPDATER_FAKTAAVKLARING,
    dokument,
  });
}
