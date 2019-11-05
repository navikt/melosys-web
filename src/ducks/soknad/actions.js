import * as Types from './types';

/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

/* eslint-disable import/prefer-default-export */
export function oppdaterSoknadState(dokument) {
  return ({
    type: Types.OPPDATER_SOKNAD,
    dokument,
  });
}

export function oppdaterPeriode(periode) {
  return ({
    type: Types.OPPDATER_PERIODE,
    data: {
      soknadsperiode: periode,
    },
  });
}

/** Tømmer avklartefakta-state når komponenten unmounter
 *
 * @returns {{type: *}}
 */
export function resetSoknadState() {
  return { type: Types.RESET };
}

export function OK(data) {
  return { type: Types.OK, data };
}
