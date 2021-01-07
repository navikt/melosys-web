import { KTObject } from "@navikt/melosys-kodeverk";

export type Mottaksretning = KTObject;

export interface Dokument {
  dokumentID: string;
  tittel: string;
  logiskeVedlegg: string[];
}

export interface FysiskDokument extends Dokument {
  id: string;
  journalpostID: string;
  dato: string | null;
  avsenderEllerMottaker: string;
}

export interface DokumentOversikt {
  journalforingDato: string | null;
  avsenderEllerMottaker: string;
  journalpostID: string;
  mottaksretning: Mottaksretning;
  mottattDato: string | null;
  hoveddokument: Dokument;
  vedlegg: Dokument[];
}

export interface BrevPdfData {
  mottaker: string | null;
  fritekst: string | null;
  begrunnelseKode: string | null;
  ytterligereInformasjon: string | null;
}

export interface SedPdfData {
  begrunnelseUtenlandskMyndighet: string | null;
  vilSendeAnmodningOmMerInformasjon: boolean | null;
  nyttLovvalgsland: string | null;
  fritekst: string | null;
}
