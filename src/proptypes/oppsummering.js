/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const OppsummeringPropType = PT.shape({
  gsakId: PT.number,
  status: PT.string,
  type: PT.string,
  registrertDato: PT.string,
});

export {
  OppsummeringPropType as Oppsummering,
};
