import * as Types from './types';

/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

export function oppdaterSteg(steg, felt, verdi) {
  return ({
    type: Types.OPPDATER_RESSURS,
    data: { steg, felt, verdi },
  });
}

export function nyttSteg(steg) {
  return ({
    type: Types.NYTT_STEG,
    data: { steg },
  });
}

export function slettSteg(steg) {
  return ({
    type: Types.SLETT_STEG,
    data: { steg },
  });
}
