import { KTObject } from "@navikt/melosys-kodeverk";

export interface Resultat {
  vedtak?: string;
  bestemmelse?: string;
  tilleggsbestemmelse?: string;
  lovvalgsperiodeFom?: string;
  lovvalgsperiodeTom?: string;
  lovvalgsland?: string;
  innledningFritekst?: string;
  begrunnelseFritekst?: string;
  nyVurderingBakgrunn?: string;
}

export interface EnkeltSteg {
  navn: StegNavn;
  status: string;
  nummer: number;
}

export enum StegNavn {
  INNGANG = "INNGANG",
  BESTEMMELSE = "BESTEMMELSE",
  VEDTAK = "VEDTAK",
}

export interface StegData {
  periodeFom?: string;
  periodeTom?: string | null;
  soeknadsland?: KTObject;
  landValg: KTObject[];
  landValgUtenStøtte: KTObject[];
  vedtakValg?: KTObject[];
  bestemmelseValg?: KTObject[];
  tilleggsbestemmelseValg?: KTObject;
}

export type FlytResDto = {
  steg: EnkeltSteg[];
  resultat: Resultat;
  data: StegData;
};
