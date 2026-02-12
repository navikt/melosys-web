/**
 * Felles periodetyper.
 * BasePeriode er generisk og kan gjenbrukes av alle periodetyper.
 */

// Generisk base for alle perioder - kun datoer
export interface BasePeriode {
  fomDato: string;
  tomDato: string;
}

// Medlemskapsperiode - har alle de komplekse feltene
export interface MedlemskapsperiodeForAvgift extends BasePeriode {
  id: number;
  type: "MEDLEMSKAPSPERIODE";
  bestemmelse: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
  medlemskapstype: string;
}

// Helseutgiftdekkesperiode i årsavregning-kontekst - kun datoer
// NB: HelseutgiftDekkesPeriodeDto (egen fil) brukes for CRUD og har bostedLandkode
export interface HelseutgiftdekkesperiodeForAvgift extends BasePeriode {
  id: number;
  type: "HELSEUTGIFTDEKKESPERIODE";
}

// Lovvalgsperiode - backend har også lovvalgsland og tilleggsbestemmelse, men ikke eksponert i AvgiftspliktigPeriodeDto
export interface LovvalgsperiodeForAvgift extends BasePeriode {
  id: number;
  type: "LOVVALGSPERIODE";
  bestemmelse: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
  medlemskapstype: string;
}

// Discriminated union
export type Avgiftspliktigperiode =
  | MedlemskapsperiodeForAvgift
  | HelseutgiftdekkesperiodeForAvgift
  | LovvalgsperiodeForAvgift;

// Type guard hjelpefunksjoner
export const erMedlemskapsperiode = (periode: Avgiftspliktigperiode): periode is MedlemskapsperiodeForAvgift => {
  return periode.type === "MEDLEMSKAPSPERIODE";
};

export const erLovvalgsperiode = (periode: Avgiftspliktigperiode): periode is LovvalgsperiodeForAvgift => {
  return periode.type === "LOVVALGSPERIODE";
};

export const erHelseutgiftdekkesperiode = (
  periode: Avgiftspliktigperiode,
): periode is HelseutgiftdekkesperiodeForAvgift => {
  return periode.type === "HELSEUTGIFTDEKKESPERIODE";
};

export const erPeriodeListeHelseutgiftdekkesperiode = (
  perioder: Avgiftspliktigperiode[],
): perioder is HelseutgiftdekkesperiodeForAvgift[] => {
  return perioder.every((periode) => periode.type === "HELSEUTGIFTDEKKESPERIODE");
};

export const erMedlemskapsperiodeEllerLovvalgsperiode = (
  periode: Avgiftspliktigperiode,
): periode is MedlemskapsperiodeForAvgift | LovvalgsperiodeForAvgift => {
  return erMedlemskapsperiode(periode) || erLovvalgsperiode(periode);
};
