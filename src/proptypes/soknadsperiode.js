/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';
import { Periode } from './periode';

const SoknadsperiodePropType = PT.shape({
  periode: Periode,
});

export { SoknadsperiodePropType as Soknadsperiode };
