import { getAsJson, postAsJson, putAsJson } from "../../utils";
import { API_BASE_URL, AARSAVREGNING } from "../../api-constants";
import { InntektskildeDto, SkatteforholdDto } from "../trygdeavgift";
import { Medlemskapsperiode } from "../medlemavfolketrygden/medlemskapsperioder";

export type AarsavregningResponse = {
  aar: number;
  tidligereGrunnlagsopplysninger?: Grunnlagsopplysninger;
  avvikFunnet?: boolean;
  nyttGrunnlag?: Grunnlagsopplysninger;
  avregning?: Avregning;
};

export type AarsavregningRequest = {
  avregning: Avregning;
};

export type Grunnlagsopplysninger = {
  trygdeavgiftsgrunnlag: Trygdeavgiftsgrunnlag;
  avgift: Avgift;
};

export type Trygdeavgiftsgrunnlag = {
  medlemskapsperioder: Medlemskapsperiode[];
  skatteforholdsperioder: SkatteforholdDto[];
  inntektskperioder: InntektskildeDto[];
};

export type Avgift = {
  trygdeavgiftsperioder: Trygdeavgiftsperiode[];
  totalInntekt: number;
  totalAvgift: number;
};

export type Trygdeavgiftsperiode = {
  fom: string;
  tom: string;
  inntektskildetype: string;
  arbeidsgiversavgiftBetales: boolean;
  inntektPerMd: number;
  avgiftssats: number;
  avgiftPerMd: number;
};

export type Avregning = {
  nyttTotalbeloep?: number;
  tidligereFakturertBeloep?: number;
  tilFaktureringBeloep?: number;
};

export const hentAarsavregning = (behandlingID: number): Promise<AarsavregningResponse> =>
  getAsJson(`${API_BASE_URL}${AARSAVREGNING}/${behandlingID}`);

export type LagAarsavregningRequest = {
  aar: number;
};

export const lagAarsavregning = (
  behandlingID: number,
  request: LagAarsavregningRequest
): Promise<AarsavregningResponse> => postAsJson(`${API_BASE_URL}${AARSAVREGNING}/${behandlingID}`, request);

export const oppdaterTotalBelop = (
  behandlingID: number,
  request: AarsavregningRequest
): Promise<AarsavregningResponse> => putAsJson(`${API_BASE_URL}${AARSAVREGNING}/${behandlingID}`, request);
