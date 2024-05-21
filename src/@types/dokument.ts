import { KTObject } from "@navikt/melosys-kodeverk";

/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
export type Mottaksretning = KTObject;

/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
export interface Dokument {
  dokumentID: string;
  tittel: string;
  logiskeVedlegg: string[];
}

/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
export interface FysiskDokument extends Dokument {
  id: string;
  journalpostID: string;
  dato: string | null;
  avsenderEllerMottaker: string;
}

/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
export interface DokumentOversikt {
  journalforingDato: string | null;
  avsenderEllerMottaker: string;
  journalpostID: string;
  mottaksretning: Mottaksretning;
  mottattDato: string | null;
  hoveddokument: Dokument;
  vedlegg: Dokument[];
}

/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
export interface SedPdfData {
  begrunnelseUtenlandskMyndighet?: string | null;
  vilSendeAnmodningOmMerInformasjon?: boolean | null;
  nyttLovvalgsland?: string | null;
  fritekst?: string | null;
}
