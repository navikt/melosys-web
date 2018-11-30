/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

import { Kodeverk } from './kodeverk';

const OppsummeringPropType = PT.shape({
  saksnummer: PT.string,
  sakstype: Kodeverk,
  behandlingID: PT.number,
  status: Kodeverk,
  registrertDato: PT.string,
  endretDato: PT.string,
  opprettetDato: PT.string,
  aktivTil: PT.string,
  sisteOpplysningerHentetDato: PT.string,
  behandlingstype: Kodeverk,
});

export { OppsummeringPropType as Oppsummering };
