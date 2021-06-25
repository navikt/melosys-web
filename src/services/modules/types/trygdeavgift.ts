export type AvgiftsgrunnlagInfo = {
  erSkattepliktig: boolean | null;
  betalerArbeidsgiverAvgift: boolean | null;
  særligAvgiftsgruppe: string | null;
};

export type Avgiftsgrunnlag = {
  lønnsforhold: string | null;
  trygdeavgiftsgrunnlagNorge: AvgiftsgrunnlagInfo | null;
  trygdeavgiftsgrunnlagUtland: AvgiftsgrunnlagInfo | null;
  vurderingTrygdeavgiftNorskInntekt: string | null;
  vurderingTrygdeavgiftUtenlandskInntekt: string | null;
};

type Avgiftsperiode = {
  fom: string;
  tom: string;
  trygdedekning: string;
  avgiftssats: number;
  avgiftPerMd: number;
};

export type Avgiftsberegning = {
  avgiftspliktigLønnNorge: number | null;
  avgiftspliktigLønnUtland: number | null;
  avgiftsperioderNorge: Avgiftsperiode[];
  avgiftsperioderUtland: Avgiftsperiode[];
};
