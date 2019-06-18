/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

import { Periode } from '../../periode';

const SedPropType = PT.shape({
  rinaSaksnummer: PT.string,
  rinaDokumentID: PT.string,
  fnr: PT.number,
  lovvalgsPeriode: Periode,
  lovvalgsBestemmelse: PT.string,
  lovvalgslandKode: PT.string,
  erEnding: PT.bool,
  statsborgerskapKoder: PT.arrayOf(PT.string),
});
export { SedPropType as SED };
