/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const BehandlingsresultatPropType = PT.shape({
  henleggelsesFritekst: PT.string,
  henleggelsesgrunner: PT.string,
});

export { BehandlingsresultatPropType as Behandlingsresultat };
