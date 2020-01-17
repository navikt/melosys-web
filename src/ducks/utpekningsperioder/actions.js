import * as Types from './types';

export function oppdaterUtpekningsperioder(utpekningsperioder) {
  return ({
    type: Types.OPPDATER_UTPEKNINGSPERIODER,
    utpekningsperioder,
  });
}

export function resetUtpekningsperioderState() {
  return { type: Types.RESET };
}
