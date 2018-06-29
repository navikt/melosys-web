/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

import { Periode } from './periode';

const OppholdUtlandPropType = PT.shape({
  oppholdsland: PT.arrayOf(PT.string),
  oppholdsPeriode: Periode,
  studentFinansiering: PT.string,
  studentSemester: PT.string,
  studieLand: PT.array,
});

export { OppholdUtlandPropType as OppholdUtland };
