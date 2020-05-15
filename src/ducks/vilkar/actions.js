import * as Types from './types';

/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

/* eslint-disable import/prefer-default-export */
export function oppdaterState(alleVilkaar) {
  return ({
    type: Types.OPPDATER_VILKAR,
    data: { vilkar: alleVilkaar },
  });
}

/** Tømmer avklartefakta-state når komponenten unmounter
 *
 * @returns {{type: *}}
 */
export function resetState() {
  return { type: Types.RESET };
}
