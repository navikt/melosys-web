/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const AvklartefaktaPropType = PT.arrayOf(PT.shape({
  avklartefaktaKode: PT.string,
  begrunnelseFritekst: PT.string,
  begrunnelseKoder: PT.arrayOf(PT.string),
  fakta: PT.arrayOf(PT.string),
  referanse: PT.string,
  subjektID: PT.string
}));

export { AvklartefaktaPropType as Avklartefakta };
