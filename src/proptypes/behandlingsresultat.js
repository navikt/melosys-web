/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const BehandlingsresultatPropType = PT.shape({
  begrunnelser: PT.arrayOf(PT.string),
  begrunnelseFritekst: PT.string,
});

export { BehandlingsresultatPropType as Behandlingsresultat };
