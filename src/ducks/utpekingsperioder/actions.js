import * as Types from './types';

export function oppdaterUtpekingsperioder(utpekingsperioder) {
  return ({
    type: Types.OPPDATER_UTPEKINGSPERIODER,
    utpekingsperioder,
  });
}

export function resetUtpekingsperioderState() {
  return { type: Types.RESET };
}
