import { getAsJson, postAsJson } from "../../utils";
import { AARSAVREGNING, API_BASE_URL, BEHANDLINGER } from "../../api-constants";
import { InntektskildeDto, SkatteforholdDto } from "../trygdeavgift";
import { Medlemskapsperiode } from "../medlemavfolketrygden/medlemskapsperioder";

export interface AarsavregningResponse {
  aarsavregningID: number;
  aar: number;
  tidligereGrunnlagsopplysninger?: Grunnlagsopplysninger;
  avvikFunnet?: boolean;
  nyttGrunnlag?: Grunnlagsopplysninger;
  avregning?: Avregning;
}

export interface AarsavregningRequest {
  avregning: Avregning;
}

export interface Grunnlagsopplysninger {
  trygdeavgiftsgrunnlag: Trygdeavgiftsgrunnlag;
  avgift: Avgift;
}

export interface Trygdeavgiftsgrunnlag {
  medlemskapsperioder: Medlemskapsperiode[];
  skatteforholdsperioder: SkatteforholdDto[];
  inntektskperioder: InntektskildeDto[];
}

export interface Avgift {
  trygdeavgiftsperioder: Trygdeavgiftsperiode[];
  totalInntekt: number;
  totalAvgift: number;
}

export interface Trygdeavgiftsperiode {
  fom: string;
  tom: string;
  inntektskildetype: string;
  arbeidsgiversavgiftBetales: boolean;
  inntektPerMd: number;
  avgiftssats: number;
  avgiftPerMd: number;
}

export interface Avregning {
  nyttTotalbeloep?: number;
  tidligereFakturertBeloep?: number;
  tilFaktureringBeloep?: number;
}

export interface AarsavregningListResponse {
  aarsavregningId: number;
  behandlingID: number;
  aar: number;
  resultattype: string;
}

export const hentAarsavregning = (behandlingID: number): Promise<AarsavregningResponse> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${AARSAVREGNING}`);

export interface LagAarsavregningRequest {
  aar: number;
}

export const lagAarsavregning = (
  behandlingID: number,
  request: LagAarsavregningRequest,
): Promise<AarsavregningResponse> =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${AARSAVREGNING}`, request);
