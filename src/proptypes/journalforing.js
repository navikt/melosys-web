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
  sakstype: PT.shape({
    kode: PT.string,
    term: PT.string,
  }),
  dokument: PT.shape({
    navn: PT.string,
    mottattDato: PT.string,
    tittel: Kodeverk,
    vedleggstitler: PT.arrayOf(Kodeverk),
    url: PT.string,
  }),
});

export {
  JournalforingPropType as Journalforing,
};
