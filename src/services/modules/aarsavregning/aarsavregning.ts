import { getAsJson } from "../../utils";
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
  fom: string; // Assuming LocalDate is a date string in ISO format
  tom: string; // Assuming LocalDate is a date string in ISO format
  skatteplikttype: string;
};

export type Medlemskapsperiode = {
  fom: string; // Assuming LocalDate is a date string in ISO format
  tom: string; // Assuming LocalDate is a date string in ISO format
  trygdedekning: String;
};

export type Trygdeavgiftsperiode = {
  fom: string; // Assuming LocalDate is a date string in ISO format
  tom: string; // Assuming LocalDate is a date string in ISO format
  inntektskildetype: String;
  arbeidsgiversavgiftBetales: boolean;
  inntektPerMd: number;
  avgiftssats: number;
  avgiftPerMd: number;
};

export type Inntektsperiode = {
  fom: string; // Assuming LocalDate is a date string in ISO format
  tom: string; // Assuming LocalDate is a date string in ISO format
  type: String;
  arbeidsgiversavgiftBetales: boolean;
  inntektPerMd: number;
};

export type Avregning = {
  nyttTotalbeloep: number;
  tidligereFakturertBeloep: number;
  tilFaktureringBeloep: number;
};

export const hentAvregningsData = (avregningID: number): Promise<AarsavregningResponse> =>
  getAsJson(`${API_BASE_URL}/${AARSAVREGNING}/${avregningID}`);
