/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const ArbeidUtlandPropType = PT.arrayOf(PT.shape({
  adresse: PT.shape({
    postnummer: PT.string,
    landkode: PT.string,
    poststed: PT.string,
  }),
  arbeidUtlandHjemmekontor: PT.bool,
  foretakNavn: PT.string,
  foretakOrgnr: PT.string,
}));

export { ArbeidUtlandPropType as ArbeidUtland };
