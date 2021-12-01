import * as Api from "../../../services/api";

export interface SendBrevFormValues {
  valgtMal?: Api.DokumenterV2.TilgjengeligeMaler;
  type?: string;
  mottaker?: string;
  organisasjonsnummer?: string;
  kontaktperson?: string;
  arbeidsgiver?: string;
  felt?: {
    [key: string]: any;
  };
}
