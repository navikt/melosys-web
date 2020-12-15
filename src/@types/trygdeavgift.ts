import { OppdaterAvgiftsberegning, OppdaterAvgiftsgrunnlag } from '../services/modules/trygdeavgift';

export type Avgiftsgrunnlag = OppdaterAvgiftsgrunnlag & {
  vurderingTrygdeavgiftNorskInntekt: string | null,
  vurderingTrygdeavgiftUtenlandskInntekt: string | null,
};

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
