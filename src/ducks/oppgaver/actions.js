/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

import * as Types from './types';

/* eslint-disable import/prefer-default-export */
export function plukkOppgaveState(oppgave) {
  return ({
    type: Types.PLUKK_OPPGAVE,
    oppgave,
  });
}
