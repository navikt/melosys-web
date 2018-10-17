import * as Types from './types';

/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

/* eslint-disable import/prefer-default-export */
export function oppdaterVilkarState(dokument) {
  return ({
    type: Types.OPPDATER_VILKAR,
    data: dokument,
  });
}
