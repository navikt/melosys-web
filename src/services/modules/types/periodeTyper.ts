/**
 * Felles periodetyper for avgiftspliktige perioder.
 * Brukes på tvers av medlemskapsperioder, lovvalgsperioder, helseutgiftdekkesperioder og årsavregning.
 */

// Felles felt for alle avgiftspliktige perioder
export interface BaseAvgiftspliktigperiode {
  id: number;
  fomDato: string;
  tomDato: string;
  redigerbar?: boolean;
}

// Medlemskapsperiode - har alle de komplekse feltene
export interface Medlemskapsperiode extends BaseAvgiftspliktigperiode {
  type: "MEDLEMSKAPSPERIODE";
  bestemmelse: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
  medlemskapstype: string;
}

// Helseutgiftdekkesperiode i årsavregning-kontekst - kun datoer
// NB: HelseutgiftDekkesPeriodeDto (egen fil) brukes for CRUD og har bostedLandkode
export interface Helseutgiftdekkesperiode extends BaseAvgiftspliktigperiode {
  type: "HELSEUTGIFTDEKKESPERIODE";
}

// Lovvalgsperiode - backend har også lovvalgsland og tilleggsbestemmelse, men ikke eksponert i AvgiftspliktigPeriodeDto
export interface Lovvalgsperiode extends BaseAvgiftspliktigperiode {
  type: "LOVVALGSPERIODE";
  bestemmelse: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
  medlemskapstype: string;
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
