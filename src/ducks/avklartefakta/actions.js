/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

import * as Types from './types';

/* eslint-disable import/prefer-default-export */
export function oppdaterAvklartefaktaState(dokument) {
  return ({
    type: Types.OPPDATER_AVKLARTEFAKTA,
    dokument,
  });
}

/** Tømmer avklartefakta-state når komponenten unmounter
 *
 * @returns {{type: *}}
 */
export function resetAvklartefaktaState() {
  return { type: Types.RESET };
}
