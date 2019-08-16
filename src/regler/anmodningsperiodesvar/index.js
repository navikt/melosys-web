export const anmodningsperiodesvartype = 'anmodningsperiodesvar';

export const slettAnmodningsperiodesvar = felt => ({
  felt,
  type: anmodningsperiodesvartype,
});

export const lagAnmodningsperiodesvar = felt => (
  {
    felt: anmodningsperiodesvartype,
    oppdaterRedux: true,
    type: anmodningsperiodesvartype,
    innhold: felt,
  }
);

export const konverterAnmodningsperiodesvarTilStegData = anmodningsperiodesvar => (
  {
    felt: anmodningsperiodesvartype,
    type: anmodningsperiodesvartype,
    innhold: anmodningsperiodesvar,
  }
);
