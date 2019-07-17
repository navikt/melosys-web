import * as Types from './types';

export function oppdaterAnmodningsperiodesvar(anmodningsperiodesvar) {
  return ({
    type: Types.OPPDATER_ANMODNINGSPERIODESVAR,
    anmodningsperiodesvar,
  });
}

export function resetAnmodningsperiodesvarState() {
  return { type: Types.RESET };
}
