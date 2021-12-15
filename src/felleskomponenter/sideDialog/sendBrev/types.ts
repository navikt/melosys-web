import { DokumenterV2 } from "../../../services/api";

export interface SendBrevFormValues {
  valgtMal?: DokumenterV2.TilgjengeligeMaler;
  type?: string;
  mottaker?: string;
  organisasjonsnummer?: string;
  kontaktperson?: string;
  arbeidsgiver?: string;
  felt?: {
    [key: string]: any;
  };
}
