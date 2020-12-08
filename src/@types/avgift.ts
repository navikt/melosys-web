export type InntekstInformasjon = {
  erSkattepliktig?: boolean,
  betalerArbeidsgiverAvgift?: boolean,
  særligAvgiftsgruppe?: string | null,
  vurderingTrygdeavgiftNorskInntekt?: string,
  vurderingTrygdeavgiftUtenlandskInntekt?: string,
}

export type AvgiftsLoenn = {
  lønnsforhold?: string,
  inntektsInformasjonNorge?: InntekstInformasjon,
  inntektsInformasjonUtland?: InntekstInformasjon,
};

export type Avgiftsperiode = {
  fom: string,
  tom: string,
  trygdedekning: string,
  avgiftssats: number,
  avgiftPerMd: number,
}

export type AvgiftsBeregning = {
  avgiftspliktigLønnNorge: number,
  avgiftsperioderNorge?: Avgiftsperiode[],
  avgiftspliktigLønnUtland: number,
  avgiftsperioderUtland?: Avgiftsperiode[],
}
