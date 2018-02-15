/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const ArbeidsavtalePropType = PT.shape({
  gyldigTil: PT.string,
  arbeidstidsordning: PT.string,
  yrke: PT.string,
  avtaltArbeidstimerPerUke: PT.number,
  stillingsprosent: PT.number,
  beregnetAntallTimerPrUke: PT.number,
  maritimArbeidsavtale: PT.bool,
  endringsdatoStillingsprosent: PT.string,
  antallTimerFraGammeltRegister: PT.string,
});

const ArbeidsavtalerPropType = PT.arrayOf(ArbeidsavtalePropType);

export {
  ArbeidsavtalePropType as Arbeidsavtale,
  ArbeidsavtalerPropType as Arbeidsavtaler,
};
