import { ReactNode } from "react";
import { KTObject } from "@navikt/melosys-kodeverk";

export type Menypunkt =
  | "Person"
  | "Familieforhold"
  | "Medlemskap"
  | "EU/EØS-barnetrygd"
  | "Arbeidsforhold og inntekt"
  | "Arbeidsgiver/virksomhet"
  | "Fullmektig"
  | "Periode"
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
  label: string;
  links: Link[];
}

export interface ContentProps {
  alternativLandsliste?: KTObject[];
  visArbeidsforholdRolleEtiketter: boolean;
  redigerbart: boolean;
  behandlingsgrunnlagEtikett: ReactNode;
  visBehandlingsgrunnlagData: boolean;
  lagreSoknadOgOppfriskSaksopplysninger: () => void;
  setMenypanelFeilmelding: (feilmelding: string) => void;
  visEktefelleSamboerMedPaReisen: boolean;
}
