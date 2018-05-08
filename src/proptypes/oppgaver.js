import PT from 'prop-types';
import * as MPT from './index';

const SakEnkeltLinjePropType = PT.shape({
  oppgaveID: PT.string,
  oppgavetype: MPT.Kodeverk,
  sammensattNavn: PT.string,
  saksnummer: PT.string,
  sakstype: MPT.Kodeverk,
  behandling: PT.shape({
    status: MPT.Kodeverk,
    type: MPT.Kodeverk,
  }),
  aktivTil: PT.string,
  soknadsperiode: MPT.Periode,
  land: PT.array,
});

const JournalForingEnkeltLinjePropType = PT.shape({
  oppgaveID: PT.string,
  oppgavetype: MPT.Kodeverk,
  journalpostID: PT.string,
  aktivTil: PT.string,
});

const MineOppgaverPropType = PT.arrayOf(PT.oneOf([JournalForingEnkeltLinjePropType, SakEnkeltLinjePropType]));

const OppgaveSokPropType = PT.shape({
  fnr: PT.string,
  kjoenn: PT.string,
  registrertDato: PT.string,
  saksnummer: PT.string,
  sammensattNavn: PT.string,
  status: PT.string,
  type: PT.string,
});

const OppgaverSokPropType = PT.arrayOf(OppgaveSokPropType);

export {
  SakEnkeltLinjePropType as SakEnkeltLinje,
  JournalForingEnkeltLinjePropType as JournalForingEnkeltLinje,
  MineOppgaverPropType as MineOppgaver,
  OppgaveSokPropType as OppgaveSok,
  OppgaverSokPropType as OppgaverSok,
};
