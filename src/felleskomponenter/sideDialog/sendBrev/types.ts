import * as Api from "../../../services/api";

export interface Felt {
  feltVerdi?: string;
  valg?: string;
}

export type Melding = { melding: string };
export type FeltbladError = { feltVerdi?: Melding; valg?: Melding };
export type ErrorsMap = Record<string, FeltbladError>;
export type ValgtMottakerType = { rolle?: string };

export interface SyncErrors {
  erFeltGyldig?: boolean;
  // Nested felt-feil fra schema (Yup message på path "felt")
  felt?: ErrorsMap;
  // Andre feilnøkler kan være string/boolean, men vi åpner også for ErrorsMap der det er relevant
  [key: string]: string | boolean | undefined | ErrorsMap;
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
  organisasjonFunnet?: boolean;
  norskeMyndigheter?: string[];
  kontaktperson?: string;
  arbeidsgiver?: string;
  felt?: {
    [key: string]: Felt;
  };
  kopiTilBruker?: boolean;
  trygdemyndighet?: string;
  aktivtUtkast?: Api.Brevutkast.BrevutkastResDto | null;
  showFieldErrors?: boolean;
}
