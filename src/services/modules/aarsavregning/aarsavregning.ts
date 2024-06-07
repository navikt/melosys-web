import { getAsJson, postAsJson } from "../../utils";
import { API_BASE_URL, AARSAVREGNING } from "../../api-constants";

export type AarsavregningResponse = {
  aar: number;
  tidligereOpplysninger?: TidligereOpplysninger;
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

export type TidligereOpplysninger = {
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

export const hentAvregningsData = (behandlingsId: number): Promise<AarsavregningResponse> =>
  getAsJson(`${API_BASE_URL}${AARSAVREGNING}/${behandlingsId}`);

export type LagAarsavregningRequest = {
  aar: number;
  behandlingsId: number;
};

export const lagAvregningsData = (request: LagAarsavregningRequest): Promise<Number> =>
  postAsJson(`${API_BASE_URL}${AARSAVREGNING}/opprettAarsavregning`, request);
