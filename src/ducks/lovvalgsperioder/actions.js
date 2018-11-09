import * as Types from './types';

/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

/* eslint-disable import/prefer-default-export */
export function oppdaterLovvalgsperioderState(dokument) {
  return ({
    type: Types.OPPDATER_LOVVALGSPERIODER,
    data: dokument,
  });
}

/** Tømmer avklartefakta-state når komponenten unmounter
 *
 * @returns {{type: *}}
 */
export function resetLovvalgsperioderState() {
  return { type: Types.RESET };
}
