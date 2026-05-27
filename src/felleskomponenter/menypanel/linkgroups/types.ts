import { ReactNode } from "react";

export type Menypunkt =
  | "Person"
  | "Fakturainformasjon"
  | "Familieforhold"
  | "Medlemskap"
  | "EU/EØS-barnetrygd"
  | "Arbeidsforhold og inntekt"
  | "Pensjonsopptjening"
  | "Arbeidsgiver/virksomhet"
  | "Fullmektig"
  | "Periode og land"
  | "Utenlandsoppdraget"
  | "Lønn og godtgjørelser"
  | "Arbeidssted(er)"
  | "Om virksomheten i Norge"
  | "Øvrig om arbeidstaker";

export interface Link {
  label: Menypunkt;
  active: boolean;
  content: ReactNode;
}

export interface LinkGroup {
  label?: string;
  links: Link[];
}

export interface ContentProps {
  visArbeidsforholdRolleEtiketter: boolean;
  redigerbart: boolean;
  visMottatteOpplysningerData: boolean;
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
  behandlingstema: string;
  endreFokus: boolean;
}
