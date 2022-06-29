import * as KV from "../../../kodeverk";

export interface Oppgave {
  tema: keyof typeof KV.Koder.Tema;
  oppgavetype?: string;
  registrertDato?: string;
  frist?: string;
  sakID?: string;
  oppgaveID?: string;
  journalpostID?: string;
}
