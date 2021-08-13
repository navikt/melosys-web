/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
type Periode = {
  fom: string;
  tom: string;
};

/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
type Lovvalgsperiode = {
  fomDato: string;
  tomDato: string;
};

export type { Periode, Lovvalgsperiode };

/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
export type Medlemskapsperiode = {
  id: number;
  arbeidsland: string;
  fomDato: string;
  tomDato: string;
  bestemmelse: string;
  innvilgelsesResultat: string;
  trygdedekning: string;
  medlemskapstype: string;
};

/**
 * @deprecated Typer fra Api flyttes til Api-modul
 */
export type OppdaterMedlemskapsperiode = {
  fomDato: string;
  tomDato: string | null;
  innvilgelsesResultat: string;
  trygdedekning: string;
};
