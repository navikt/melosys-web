import * as Types from './types';

/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

/* eslint-disable import/prefer-default-export */
export function oppdaterState(dokument) {
  return ({
    type: Types.OPPDATER_BEHANDLINGSGRUNNLAG,
    dokument,
  });
}

export function oppdaterPeriode(periode) {
  return ({
    type: Types.OPPDATER_PERIODE,
    data: {
      periode,
    },
  });
}

/** Tømmer avklartefakta-state når komponenten unmounter
 *
 * @returns {{type: *}}
 */
export function resetState() {
  return { type: Types.RESET };
}

export function OK(data) {
  return { type: Types.OK, data };
}
