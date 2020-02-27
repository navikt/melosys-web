/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const PeriodePropType = PT.shape({
  fom: PT.string,
  tom: PT.string,
});

const LovvalgsperiodePropType = PT.shape({
  fomDato: PT.string,
  tomDato: PT.string,
});

export {
  PeriodePropType as Periode,
  LovvalgsperiodePropType as Lovvalgsperiode,
};
