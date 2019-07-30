/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const BehandlingsresultatPropType = PT.shape({
  behandlingsresultatTypeKode: PT.string,
  begrunnelseKoder: PT.arrayOf(PT.string),
  begrunnelseFritekst: PT.string,
});

export { BehandlingsresultatPropType as Behandlingsresultat };
