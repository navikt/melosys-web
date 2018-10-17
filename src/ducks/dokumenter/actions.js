/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

import * as Types from './types';

export function resetDokment() {
  return ({
    type: Types.RESET,
    data: {},
  });
}
