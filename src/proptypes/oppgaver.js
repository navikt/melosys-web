import PT from 'prop-types';
import * as MPT from './index';

const JournalforingOppgavePropType = PT.shape({
  oppgaveID: PT.string,
  journalpostID: PT.string,
  aktivTil: PT.string,
  prioritet: PT.string,
  versjon: PT.number,
  ansvarligID: PT.string,
});
const SaksbehandlingOppgavePropType = PT.shape({
  oppgaveID: PT.string,
  sammensattNavn: PT.string,
  saksnummer: PT.string,
  sakstype: MPT.Kodeverk,
  behandling: PT.shape({
    behandlingID: PT.number,
    behandlingType: MPT.Kodeverk,
    behandlingsstatus: MPT.Kodeverk,
    endretDato: PT.string,
  }),
  aktivTil: PT.string,
  soknadsperiode: MPT.Periode,
  land: PT.arrayOf(PT.string),
  prioritet: PT.string,
  versjon: PT.number,
  ansvarligID: PT.string,
  sistOppdatert: PT.string,
  erUnderOppdatering: PT.bool,
});
const MineOppgaverPropType = PT.shape({
  journalforing: PT.arrayOf(JournalforingOppgavePropType),
  saksbehandling: PT.arrayOf(SaksbehandlingOppgavePropType),
});

export {
  JournalforingOppgavePropType as JournalforingOppgave,
  SaksbehandlingOppgavePropType as SaksbehandlingOppgave,
  MineOppgaverPropType as MineOppgaver,
};
