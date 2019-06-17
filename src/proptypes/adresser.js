/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';
import { Kodeverk } from './kodeverk';

const GeneriskAdressePropType = PT.shape({
  gateadresse: PT.shape({
    gatenavn: PT.string,
    gatenummer: PT.number,
    husnummer: PT.number,
    husbokstav: PT.string,
  }),
  postnr: PT.string,
  poststed: PT.string,
  land: PT.oneOfType([Kodeverk, PT.string]),
});

const UstrukturertAdressePropType = PT.shape({
  landkode: PT.string,
  adresselinjer: PT.arrayOf(PT.string),
});

const StrukturertAdressePropType = PT.shape({
  gatenavn: PT.string,
  husnummer: PT.string,
  region: PT.string,
  postnummer: PT.string,
  poststed: PT.string,
  landkode: PT.string,
});

const MidlertidigAdressePropType = PT.shape({
  adressetype: PT.string,
  strukturertAdresse: StrukturertAdressePropType,
  UstrukturertAdresse: PT.UstrukturertAdressePropType,
});

export {
  GeneriskAdressePropType as GeneriskAdresse,
  UstrukturertAdressePropType as UstrukturertAdresse,
  MidlertidigAdressePropType as MidlertidigAdresse,
};
