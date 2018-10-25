
/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

import * as Types from './types';

/** Tømmer fagsak-state når komponenten unmounter
 *
 * @returns {{type: *}}
 */
export function resetFagsakState() {
  return { type: Types.RESET };
}
