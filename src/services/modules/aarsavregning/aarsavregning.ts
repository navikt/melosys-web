import { getAsJson, postAsJson, putAsJson } from "../../utils";
import { API_BASE_URL, AARSAVREGNING, BEHANDLINGER, FAGSAKER } from "../../api-constants";
import { InntektskildeDto, SkatteforholdDto } from "../trygdeavgift";
import { Medlemskapsperiode } from "../medlemavfolketrygden/medlemskapsperioder";
import MKV from "../../../melosyskodeverk";

const { IKKE_SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;

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

export const oppdaterTotalBelop = (
  behandlingID: number,
  request: AarsavregningRequest,
  aarsavregningID?: number,
): Promise<AarsavregningResponse> =>
  putAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${AARSAVREGNING}/${aarsavregningID}`, request);

export const hentFiltrertAarsavregningList = (
  saksnummer: string,
  resultattype?: string,
  aar?: number,
): Promise<AarsavregningListResponse[]> => {
  let url = `${API_BASE_URL}${FAGSAKER}/${saksnummer}/${AARSAVREGNING}`;
  if (aar || resultattype) {
    url = url.concat("?");
    if (aar) {
      url = url.concat(`&aar=${aar}`);
    }
    if (resultattype) {
      url = url.concat(`&resultattype=${resultattype}`);
    }
  }
  return getAsJson(url);
};

export const erBrukerSkattepliktigIHelePerioden = (skatteforholdsperioder: any) => {
  return !skatteforholdsperioder.some((skatteforhold: any) => skatteforhold.skatteplikttype === IKKE_SKATTEPLIKTIG);
};

export const harIkkeskattepliktigInntektskilder = (
  aarsavregningResponse: AarsavregningResponse,
  medlemskapsTypeErPliktig?: boolean,
): boolean => {
  const tidligereTrygdeavgiftgrunnlag = aarsavregningResponse?.tidligereGrunnlagsopplysninger?.trygdeavgiftsgrunnlag;

  if (!tidligereTrygdeavgiftgrunnlag) {
    return false;
  }
  if (tidligereTrygdeavgiftgrunnlag.inntektskperioder.length > 0) {
    return true;
  }

  if (medlemskapsTypeErPliktig) {
    const erSkattepliktig =
      medlemskapsTypeErPliktig &&
      erBrukerSkattepliktigIHelePerioden(tidligereTrygdeavgiftgrunnlag.skatteforholdsperioder);

    return !erSkattepliktig;
  }

  return false;
};
