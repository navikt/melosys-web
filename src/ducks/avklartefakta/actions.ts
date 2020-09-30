/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */
import * as Types from './types';

export function oppdaterAvklartefaktaState(avklartefakta: Types.OppdaterActionData): Types.OppdaterAction {
  return ({
    type: Types.OPPDATER_AVKLARTEFAKTA,
    data: avklartefakta,
  });
}

/** Tømmer avklartefakta-state når komponenten unmounter
 *
 * @returns {{type: *}}
 */
export function resetAvklartefaktaState(): Types.ResetAction {
  return { type: Types.RESET };
}
