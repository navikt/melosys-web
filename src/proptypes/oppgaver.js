import PT from "prop-types";
import { Kodeverk } from "./kodeverk";
import { Periode } from "./periode";

const JournalforingOppgavePropType = PT.shape({
  oppgaveID: PT.string,
  journalpostID: PT.string,
  aktivTil: PT.string,
  prioritet: PT.string,
  versjon: PT.number,
  ansvarligID: PT.string,
  hovedpartIdent: PT.string,
  navn: PT.string,
});
const SaksbehandlingOppgavePropType = PT.shape({
  oppgaveID: PT.string,
  redigerbart: PT.bool,
  navn: PT.string,
  hovedpartIdent: PT.string,
  saksnummer: PT.string,
  sakstype: Kodeverk,
  behandling: PT.shape({
    behandlingID: PT.number,
    behandlingstype: Kodeverk,
    behandlingstema: Kodeverk,
    behandlingsstatus: Kodeverk,
    endretDato: PT.string,
    erUnderOppdatering: PT.bool,
    registrertDato: PT.string,
    svarFrist: PT.string,
  }),
  aktivTil: PT.string,
  periode: Periode,
  land: PT.shape({
    landkoder: PT.arrayOf(PT.string),
    erUkjenteEllerAlleEosLand: PT.bool,
  }),
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
