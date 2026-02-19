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
  a008Formaal?: string | null; // CDM 4.4: "endringsmelding" | "arbeid_flere_land"
  erFjernarbeidTWFA?: boolean | null;
}

export interface TilgjengeligStandardvedlegg {
  journalpostID: string;
  dokumentID: string;
  tittel: string;
  dato: string;
}
