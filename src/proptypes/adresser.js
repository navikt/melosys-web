/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

const GeneriskAdressePropType = PT.shape({
  gateadresse: PT.shape({
    gatenavn: PT.string,
    gatenummer: PT.string,
    husnummer: PT.string,
    husbokstav: PT.string,
  }),
  postnr: PT.string,
  poststed: PT.string,
  land: PT.string,
});

const BostedsAdressePropType = GeneriskAdressePropType;
const ForretningsAdressePropType = GeneriskAdressePropType;
const PostAdressePropType = GeneriskAdressePropType;

export {
  BostedsAdressePropType as BostedsAdresse,
  ForretningsAdressePropType as ForretningsAdresse,
  PostAdressePropType as PostAdresse,
  GeneriskAdressePropType as GeneriskAdresse,
};
