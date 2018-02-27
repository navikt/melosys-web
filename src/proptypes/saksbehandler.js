/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const SaksbehandlerPropType = PT.shape({
  brukernavn: PT.string,
  navn: PT.string,
});

export { SaksbehandlerPropType as Saksbehandler };
