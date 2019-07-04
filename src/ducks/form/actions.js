/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

import * as Types from './types';

/* eslint-disable import/prefer-default-export */
export function oppdaterAlleSkjemaValideringer(validering) {
  return ({
    type: Types.OPPDATER_ALLE_SKJEMA_VALIDERINGER,
    data: validering,
  });
}
