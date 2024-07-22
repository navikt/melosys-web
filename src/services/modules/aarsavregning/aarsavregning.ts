import { getAsJson, postAsJson } from "../../utils";
import { API_BASE_URL, AARSAVREGNING } from "../../api-constants";

export type AarsavregningResponse = {
  aar: number;
  tidligereGrunnlagsopplysninger?: TidligereGrunnlagsopplysninger;
  avvikFunnet?: boolean;
  nyttGrunnlag?: Trygdeavgiftsgrunnlag;
  endeligAvgift?: Avgift;
  avregning?: Avregning;
};

export type AarsavregningRequest = {
  aar: number;
  tidligereFakturertBeloep?: number;
  skatteforholdsperioder: Skatteforholdsperiode[];
  inntektskperioder: Inntektsperiode[];
};

export type TidligereGrunnlagsopplysninger = {
  trygdeavgiftsgrunnlag: Trygdeavgiftsgrunnlag;
  avgift: Avgift;
};

export type Trygdeavgiftsgrunnlag = {
  medlemskapsperioder: Medlemskapsperiode[];
  skatteforholdsperioder: Skatteforholdsperiode[];
  inntektskperioder: Inntektsperiode[];
};

export type Avgift = {
  trygdeavgiftsperioder: Trygdeavgiftsperiode[];
  totalInntektPerMd: number;
  totalAvgiftPerMd: number;
};

export type Skatteforholdsperiode = {
  fom: string;
  tom: string;
  skatteplikttype: String;
};

export type Medlemskapsperiode = {
  fom: string;
  tom: string;
  trygdedekning: String;
};

export type Trygdeavgiftsperiode = {
  fom: string;
  tom: string;
  inntektskildetype: String;
  arbeidsgiversavgiftBetales: boolean;
  inntektPerMd: number;
  avgiftssats: number;
  avgiftPerMd: number;
};

export type Inntektsperiode = {
  fom: string;
  tom: string;
  type: String;
  arbeidsgiversavgiftBetales: boolean;
  inntektPerMd: number;
};

export type Avregning = {
  nyttTotalbeloep: number;
  tidligereFakturertBeloep: number;
  tilFaktureringBeloep: number;
};

export const hentAvregningsData = (behandlingID: number): Promise<AarsavregningResponse> =>
  getAsJson(`${API_BASE_URL}${AARSAVREGNING}/${behandlingID}`);

export type LagAarsavregningRequest = {
  aar: number;
};

export const lagAvregningsData = (
  behandlingID: number,
  request: LagAarsavregningRequest
): Promise<AarsavregningResponse> => postAsJson(`${API_BASE_URL}${AARSAVREGNING}/${behandlingID}`, request);
