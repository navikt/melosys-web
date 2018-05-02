/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const OppsummeringPropType = PT.shape({
  saksnummer: PT.string,
  type: PT.string,
  status: PT.string,
  registrertDato: PT.string,
});

export { OppsummeringPropType as Oppsummering };
