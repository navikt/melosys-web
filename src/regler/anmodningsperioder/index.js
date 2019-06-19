export const anmodningsperioderType = 'anmodningsperioder';

export const konverterAnmodningsperioderTilStegData = anmodningsperioder => (
  {
    felt: anmodningsperioderType,
    type: anmodningsperioderType,
    innhold: anmodningsperioder,
  }
);
