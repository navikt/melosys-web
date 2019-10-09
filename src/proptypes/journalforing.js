/* eslint import/prefer-default-export:off */
import PT from 'prop-types';

import { Dokument, Vedlegg } from './dokument';

const JournalforingPropType = PT.shape({
  avsenderID: PT.string,
  brukerID: PT.string,
  erBrukerAvsender: PT.bool,
  hoveddokument: Dokument,
  mottattDato: PT.string,
  vedlegg: Vedlegg,
});
const JournalforingSkjemaVerdierPropType = PT.shape({
  arbeidsgiverID: PT.string,
  avsenderID: PT.string,
  avsenderNavn: PT.string,
  behandlingstype: PT.string,
  brukerID: PT.string,
  brukerNavn: PT.string,
  dokumentID: PT.string,
  erBrukerAvsender: PT.bool,
  hoveddokumentTittel: PT.string,
  mottattDato: PT.string,
  journalpostID: PT.string,
  respresentantID: PT.string,
  vedleggsTittler: PT.arrayOf(PT.string),
});
export {
  JournalforingPropType as Journalforing,
  JournalforingSkjemaVerdierPropType as JournalforingSkjemaVerdier,
};
