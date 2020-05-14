import PT from 'prop-types';
import * as MPT from './index';

const JournalforingOppgavePropType = PT.shape({
  oppgaveID: PT.string,
  journalpostID: PT.string,
  aktivTil: PT.string,
  prioritet: PT.string,
  versjon: PT.number,
  ansvarligID: PT.string,
  fnr: PT.string,
  sammensattNavn: PT.string,
});
const SaksbehandlingOppgavePropType = PT.shape({
  oppgaveID: PT.string,
  redigerbart: PT.bool,
  sammensattNavn: PT.string,
  saksnummer: PT.string,
  sakstype: MPT.Kodeverk,
  behandling: PT.shape({
    behandlingID: PT.number,
    behandlingstype: MPT.Kodeverk,
    behandlingstema: MPT.Kodeverk,
    behandlingsstatus: MPT.Kodeverk,
    endretDato: PT.string,
    erUnderOppdatering: PT.bool,
    registrertDato: PT.string,
    svarFrist: PT.string,
  }),
  aktivTil: PT.string,
  periode: MPT.Periode,
  land: PT.arrayOf(PT.string),
  prioritet: PT.string,
  versjon: PT.number,
  ansvarligID: PT.string,
  sistOppdatert: PT.string,
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
