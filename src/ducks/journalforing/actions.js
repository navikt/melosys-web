import * as Types from '../journalforing/types';

/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

export function resetJournalforing() {
  return ({
    type: Types.RESET,
    data: {},
  });
}
