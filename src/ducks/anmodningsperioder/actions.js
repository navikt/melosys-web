import * as Types from './types';

export function oppdaterAnmodningsperioder(anmodningsperioder) {
  return ({
    type: Types.OPPDATER_ANMODNINGSPERIODER,
    anmodningsperioder,
  });
}

export function resetAnmodningsperioderState() {
  return { type: Types.RESET };
}
