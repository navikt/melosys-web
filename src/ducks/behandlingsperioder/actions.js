/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */
import * as Types from './types';

export function oppdaterPerioderState(status) {
  return ({
    type: Types.OPPDATER_BEHANDLINGER,
    data: status,
  });
}


export function resetPerioderState() {
  return { type: Types.RESET };
}

