type Periode = {
  fom: string,
  tom: string,
};

type Lovvalgsperiode = {
  fomDato: string,
  tomDato: string,
};

export type {
  Periode,
  Lovvalgsperiode,
};

export type Medlemskapsperiode = {
  id: number,
  arbeidsland: string,
  fomDato: string,
  tomDato: string,
  bestemmelse: string,
  innvilgelsesResultat: string,
  trygdedekning: string,
  medlemskapstype: string,
}

export type OppdaterMedlemskapsperiode = {
  fomDato: string,
  tomDato: string,
  innvilgelsesResultat: string,
  trygdedekning: string,
}
