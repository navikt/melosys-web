/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

import * as Types from "./types";

export function reset(): Types.Action {
  return {
    type: Types.RESET,
  };
}
