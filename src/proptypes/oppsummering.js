/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

import { Kodeverk } from './kodeverk';

const OppsummeringPropType = PT.shape({
  saksnummer: PT.string,
  type: Kodeverk,
  status: Kodeverk,
  registrertDato: PT.string,
});

export { OppsummeringPropType as Oppsummering };
