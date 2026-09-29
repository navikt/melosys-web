/**
 * Felles periodetyper.
 * BasePeriode er generisk og kan gjenbrukes av alle periodetyper.
 */

// Generisk base for alle perioder - kun datoer
export interface BasePeriode {
  fomDato: string;
  tomDato: string;
}

// FTRL Medlemskapsperiode - matcher MedlemskapsperiodeDto fra backend (uten type-felt)
export interface MedlemskapsperiodeDto extends BasePeriode {
  id: number;
  bestemmelse: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
  medlemskapstype: string;
}

// Medlemskapsperiode med type-diskriminator for bruk i Avgiftspliktigperiode union
export interface MedlemskapsperiodeForAvgift extends BasePeriode {
  id: number;
  type: "MEDLEMSKAPSPERIODE";
  bestemmelse: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
  medlemskapstype: string;
}

export interface HelseutgiftdekkesperiodeForAvgift extends BasePeriode {
  id: number;
  type: "HELSEUTGIFTDEKKESPERIODE";
  bostedLandkode: string;
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

/**
 * Periodetype-diskriminator for årsavregningsperioder.
 * Bestemmer hvilken CRUD-modul som brukes og hvilke felter som er relevante i skjemaet.
 */
export type AarsavregningsPeriodeType = "MEDLEMSKAPSPERIODE" | "HELSEUTGIFTDEKKESPERIODE" | "LOVVALGSPERIODE";
