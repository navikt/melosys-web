export type AvgiftsgrunnlagInfo = {
  erSkattepliktig: boolean | null,
  betalerArbeidsgiverAvgift: boolean | null,
  særligAvgiftsgruppe: string | null,
}

export type OppdaterAvgiftsgrunnlag = {
  lønnsforhold: string | null,
  trygdeavgiftsgrunnlagNorge: AvgiftsgrunnlagInfo | null,
  trygdeavgiftsgrunnlagUtland: AvgiftsgrunnlagInfo | null,
}

export type Avgiftsgrunnlag = OppdaterAvgiftsgrunnlag & {
  vurderingTrygdeavgiftNorskInntekt: string | null,
  vurderingTrygdeavgiftUtenlandskInntekt: string | null,
};

export type OppdaterAvgiftsberegning = {
  avgiftspliktigLønnNorge: number | null,
  avgiftspliktigLønnUtland: number | null,
}

export type Avgiftsperiode = {
  fom: string,
  tom: string,
  trygdedekning: string,
  avgiftssats: number,
  avgiftPerMd: number,
}

export type Avgiftsberegning = OppdaterAvgiftsberegning & {
  avgiftsperioderNorge: Avgiftsperiode[],
  avgiftsperioderUtland: Avgiftsperiode[],
}
