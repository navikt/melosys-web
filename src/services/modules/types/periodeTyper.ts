/**
 * Felles periodetyper.
 * BasePeriode er generisk og kan gjenbrukes av alle periodetyper.
 * Avgiftspliktige perioder (medlemskap, lovvalg, helseutgift) legger til redigerbar for UI-kontroll.
 */

// Generisk base for alle perioder
export interface BasePeriode {
  id: number;
  fomDato: string;
  tomDato: string;
}

// Medlemskapsperiode - har alle de komplekse feltene
export interface Medlemskapsperiode extends BasePeriode {
  type: "MEDLEMSKAPSPERIODE";
  bestemmelse: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
  medlemskapstype: string;
  redigerbar?: boolean; // UI-only, settes i frontend basert på forretningslogikk
}

// Helseutgiftdekkesperiode i årsavregning-kontekst - kun datoer
// NB: HelseutgiftDekkesPeriodeDto (egen fil) brukes for CRUD og har bostedLandkode
export interface Helseutgiftdekkesperiode extends BasePeriode {
  type: "HELSEUTGIFTDEKKESPERIODE";
  redigerbar?: boolean; // UI-only
}

// Lovvalgsperiode - backend har også lovvalgsland og tilleggsbestemmelse, men ikke eksponert i AvgiftspliktigPeriodeDto
export interface Lovvalgsperiode extends BasePeriode {
  type: "LOVVALGSPERIODE";
  bestemmelse: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
  medlemskapstype: string;
  redigerbar?: boolean; // UI-only
}

// Discriminated union
export type Avgiftspliktigperiode = Medlemskapsperiode | Helseutgiftdekkesperiode | Lovvalgsperiode;

// Type guard hjelpefunksjoner
export const erMedlemskapsperiode = (periode: Avgiftspliktigperiode): periode is Medlemskapsperiode => {
  return periode.type === "MEDLEMSKAPSPERIODE";
};

export const erLovvalgsperiode = (periode: Avgiftspliktigperiode): periode is Lovvalgsperiode => {
  return periode.type === "LOVVALGSPERIODE";
};

export const erHelseutgiftdekkesperiode = (periode: Avgiftspliktigperiode): periode is Helseutgiftdekkesperiode => {
  return periode.type === "HELSEUTGIFTDEKKESPERIODE";
};

export const harInnvilgelsesResultat = (
  periode: Avgiftspliktigperiode,
): periode is Medlemskapsperiode | Lovvalgsperiode => {
  return erMedlemskapsperiode(periode) || erLovvalgsperiode(periode);
};
