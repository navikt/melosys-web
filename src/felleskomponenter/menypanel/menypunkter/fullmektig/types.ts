import { Organisasjon } from "../../../../services/modules/types";
import { Personopplysninger } from "../../../../graphql";

export enum Type {
  PERSON = "PERSON",
  ORGANISASJON = "ORGANISASJON",
}

export type Fullmektig = {
  id: string;
  databaseID?: number;
  fullmakter: string[];
  type?: Type;
  org?: Partial<Organisasjon>;
  person?: Personopplysninger;
  feil?: string;
  kontaktperson?: string | null;
  kontaktOrgnr?: string | null;
  kontaktOrg?: Partial<Organisasjon>;
};

export interface FieldArrayProps {
  fullmektige: Fullmektig[];
}
