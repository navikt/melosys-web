/* eslint import/prefer-default-export:off */
import PT from 'prop-types';
import { Kodeverk } from './kodeverk';

const JournalforingPropType = PT.shape({
  bruker: PT.shape({
    navn: PT.string,
    ID: PT.string,
  }),
  erBrukerAvsender: PT.bool,
  avsender: PT.shape({
    navn: PT.string,
    ID: PT.string,
  }),
  dokument: PT.shape({
    navn: PT.string,
    ID: PT.string.isRequired,
    mottattDato: PT.string,
    tittel: PT.string,
    vedleggstitler: PT.arrayOf(Kodeverk),
  }),
});

export {
  JournalforingPropType as Journalforing,
};
