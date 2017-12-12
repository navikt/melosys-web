/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const ArbeidsavtalePropType = PT.shape({
  arbeidstidsordning: PT.string,
  yrke: PT.string,
  beregnetAntallTimerPrUke: PT.number,
  endringsdatoStillingsprosent: PT.string,
  antallTimerFraGammeltRegister: PT.string,
});

export {
  ArbeidsavtalePropType as Arbeidsavtale,
};
