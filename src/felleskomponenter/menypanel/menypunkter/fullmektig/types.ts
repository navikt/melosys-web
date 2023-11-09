import { Aktoer } from "../../../../services/modules/fagsaker/aktoer";
import { BrevAdresse } from "../../../../services/modules/dokumenter-v2";

export enum Type {
  PERSON = "PERSON",
  ORGANISASJON = "ORGANISASJON",
}
export type AdresseOgFeil = { adresse?: BrevAdresse; feil?: string };

export type Fullmektig = {
  ident: string;
  databaseID?: number;
  fullmakter: string[];
  type?: Type;
  adresse?: BrevAdresse;
  feil?: string;
  originalAktør?: Aktoer;
  harLagretKontaktperson?: boolean;
  kontaktperson?: string | null;
  kontaktOrgnr?: string | null;
  kontaktTelefon?: string | null;
  kontaktOrgAdresse?: BrevAdresse;
};

export interface FieldArrayProps {
  fullmektige: Fullmektig[];
}
