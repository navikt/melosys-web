import * as Types from './types';

/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */
export const oppdaterBehandlingsStatus = status => (
  {
    type: Types.BEHANDLINGSSTATUS_UPDATE,
    data: status,
  }
);
export function resetBenadlingerState() {
  return { type: Types.RESET };
}
