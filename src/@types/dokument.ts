import { KTObject } from 'melosys-kodeverk';

export type Mottaksretning = KTObject

export interface Dokument {
  dokumentID: string,
  tittel: string,
  logiskeVedlegg: string[],
}

export interface FysiskDokument extends Dokument {
  id: string,
  dokumentID: string,
  journalpostID: string,
  logiskeVedlegg: string[],
  tittel: string,
  dato: string,
  avsenderEllerMottaker: string,
}

export interface DokumentOversikt {
  journalforingDato: string,
  avsenderEllerMottaker: string,
  journalpostID: string,
  mottaksretning: Mottaksretning,
  mottattDato: string,
  hoveddokument: Dokument,
  vedlegg: Dokument[],
}
