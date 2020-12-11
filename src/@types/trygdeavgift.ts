export type Trygdeavgiftsgrunnlag = {
  erSkattepliktig?: boolean | null,
  betalerArbeidsgiverAvgift?: boolean | null,
  særligAvgiftsgruppe?: string | null,
  vurderingTrygdeavgiftNorskInntekt?: string,
  vurderingTrygdeavgiftUtenlandskInntekt?: string,
}

export type AvgiftsLoenn = {
  lønnsforhold?: string | null,
  trygdeavgiftsgrunnlagNorge?: Trygdeavgiftsgrunnlag | null,
  trygdeavgiftsgrunnlagUtland?: Trygdeavgiftsgrunnlag | null,
};

export type Avgiftsperiode = {
  fom: string,
  tom: string,
  trygdedekning: string,
  avgiftssats: number,
  avgiftPerMd: number,
}

export type AvgiftsBeregning = {
  avgiftspliktigLønnNorge: number | null,
  avgiftsperioderNorge?: Avgiftsperiode[],
  avgiftspliktigLønnUtland: number | null,
  avgiftsperioderUtland?: Avgiftsperiode[],
}
