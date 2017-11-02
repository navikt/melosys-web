/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const ArbeidsavtalePropType = PT.shape({
  arbeidstidsordning: PT.string,
  avloenningstype: PT.string,
  yrke: PT.string,
  avtaltArbeidstimerPerUke: PT.number,
  stillingsprosent: PT.number,
  sisteLoennsendringsdato: PT.string,
  beregnetAntallTimerPrUke: PT.string,
  endringsdatoStillingsprosent: PT.string,
});

export {
  ArbeidsavtalePropType as Arbeidsavtale,
};
