/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';
import { Periode } from './periode';

const OppholdPropType = PT.shape({
  land: PT.arrayOf(PT.object),
  periode: Periode,
});

export { OppholdPropType as Opphold };
