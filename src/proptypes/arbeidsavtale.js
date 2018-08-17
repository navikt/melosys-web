/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';
import { Kodeverk } from './kodeverk';

const ArbeidsavtalePropType = PT.shape({
  gyldigTil: PT.string,
  arbeidstidsordning: PT.oneOfType([Kodeverk, PT.string]),
  yrke: PT.oneOfType([Kodeverk, PT.string]),
  skipsregister: PT.oneOfType([Kodeverk, PT.string]),
  skipstype: PT.oneOfType([Kodeverk, PT.string]),
  fartsomraade: PT.oneOfType([Kodeverk, PT.string]),
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
