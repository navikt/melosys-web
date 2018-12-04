/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

import { Kodeverk } from './kodeverk';

const OppsummeringPropType = PT.shape({
  saksnummer: PT.string,
  sakstype: Kodeverk,
  status: Kodeverk,
  registrertDato: PT.string,
  sisteOpplysningerHentetDato: PT.string,
});

export { OppsummeringPropType as Oppsummering };
