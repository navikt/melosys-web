import * as Types from "./types";

/**
 * Actions
 * -----------------------------------------------------------------------
 * Dette er action creators som returnerer Redux-klargjorte actions
 * uten support for asynkrone kall.
 */

export function oppdaterState(dokument) {
  return {
    type: Types.OPPDATER_MOTTATTE_OPPLYSNINGER,
    dokument,
  };
}

export function oppdaterPeriode(periode) {
  return {
    type: Types.OPPDATER_PERIODE,
    data: {
      periode,
    },
  };
}

export function oppdaterSoeknadsland(landkoder, flereLandUkjentHvilke) {
  return {
    type: Types.OPPDATER_SOEKNADSLAND,
    data: {
      soeknadsland: {
        landkoder,
        flereLandUkjentHvilke,
      },
    },
  };
}

export function oppdaterAvsenderland(avsenderland) {
  return {
    type: Types.OPPDATER_AVSENDERLAND,
    data: {
      avsenderland,
    },
  };
}

export function oppdaterLovvalgsland(lovvalgsland) {
  return {
    type: Types.OPPDATER_LOVVALGSLAND,
    data: {
      lovvalgsland,
    },
  };
}

export function oppdaterTrygdedekning(trygdedekning) {
  return {
    type: Types.OPPDATER_TRYGDEDEKNING,
    data: {
      trygdedekning,
    },
  };
}

export function oppdaterIkkeYrkesaktivSituasjontype(ikkeYrkesaktivSituasjontype) {
  return {
    type: Types.OPPDATER_IKKE_YRKESAKTIV_SITUASJONTYPE,
    data: {
      ikkeYrkesaktivSituasjontype,
    },
  };
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
