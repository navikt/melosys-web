/* eslint import/prefer-default-export:off */
import PT from 'prop-types';
import { Kodeverk } from './kodeverk';

const JournalforingPropType = PT.shape({
  brukerID: PT.string,
  erBrukerAvsender: PT.bool,
  avsenderID: PT.string,
  dokument: PT.shape({
    ID: PT.string.isRequired,
    mottattDato: PT.string,
    tittel: PT.string,
    vedleggstitler: PT.arrayOf(Kodeverk),
  }),
});

export { JournalforingPropType as Journalforing };
