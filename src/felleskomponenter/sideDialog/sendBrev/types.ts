import * as Api from "../../../services/api";

export interface SendBrevFormValues {
  mottaker?: string;
  type?: string;
  valgtMottaker?: Api.DokumenterV2.TilgjengeligMottaker;
  valgtBrev?: Api.DokumenterV2.TilgjengeligBrev;
  organisasjonsnummer?: string;
  kontaktperson?: string;
  arbeidsgiver?: string;
  felt?: {
    [key: string]: any;
  };
  kopimottaker?: boolean;
  trygdemyndighet?: string;
}
