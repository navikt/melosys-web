/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const AvklartefaktaPropType = PT.shape({
  avklartefaktaKode: PT.string,
  begrunnelseFritekst: PT.string,
  begrunnelseKoder: PT.arrayOf(PT.string),
  fakta: PT.arrayOf(PT.string),
  referanse: PT.string,
  subjektID: PT.string,
});

const AvklartefaktaListePropType = PT.arrayOf(AvklartefaktaPropType);

export {
  AvklartefaktaPropType as Avklartefakta,
  AvklartefaktaListePropType as AvklartefaktaListe,
};
