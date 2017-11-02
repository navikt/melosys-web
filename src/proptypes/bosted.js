/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const BostedsAdressePropType = PT.shape({
  gateadresse: PT.shape({
    gatenavn: PT.string.isRequired,
    husnummer: PT.number.isRequired,
    husbokstav: PT.string,
  }),
  postnr: PT.string.isRequired,
  poststed: PT.string.isRequired,
  land: PT.string.isRequired,
});


export {
  BostedsAdressePropType as BostedsAdresse,
};
