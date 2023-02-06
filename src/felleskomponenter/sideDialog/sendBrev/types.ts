import * as Api from "../../../services/api";

export interface SendBrevFormValues {
  mottaker?: string;
  type?: string;
  valgtMottaker?: Api.DokumenterV2.TilgjengeligMottaker;
  valgtBrev?: Api.DokumenterV2.TilgjengeligBrev;
  organisasjonsnummer?: string;
  etater?: string[];
  kontaktperson?: string;
  arbeidsgiver?: string;
  felt?: {
    [key: string]: any;
  };
  kopiTilBruker?: boolean;
  trygdemyndighet?: string;
  aktivtUtkast?: Api.Brevutkast.BrevutkastResDto | null;
}
