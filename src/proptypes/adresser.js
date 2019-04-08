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

export { GeneriskAdressePropType as GeneriskAdresse };
