/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const PeriodePropType = PT.shape({
  fom: PT.string,
  tom: PT.string,
});

export { PeriodePropType as Periode };
