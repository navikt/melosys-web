import * as Api from "../../../services/api";

export interface FeltVerdi {
  feltVerdi?: string;
  valg?: string;
}

export interface SyncErrors {
  erFeltGyldig?: boolean;
  [key: string]: string | boolean | undefined | { [feltKode: string]: { feltVerdi?: string; valg?: string } };
}

export interface BrevFelt {
  kode: string;
  paakrevd: boolean;
}
export interface SendBrevFormValues {
  mottaker?: string;
  type?: string;
  valgtMottaker?: Api.DokumenterV2.TilgjengeligMottaker;
  valgtBrev?: Api.DokumenterV2.TilgjengeligBrev;
  organisasjonsnummer?: string;
  norskeMyndigheter?: string[];
  kontaktperson?: string;
  arbeidsgiver?: string;
  felt?: {
    [key: string]: FeltVerdi;
  };
  kopiTilBruker?: boolean;
  trygdemyndighet?: string;
  aktivtUtkast?: Api.Brevutkast.BrevutkastResDto | null;
  showFieldErrors?: boolean;
}
