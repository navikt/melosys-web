import { getAsJson, postAsJson, putAsJson } from "../../utils";
import { AARSAVREGNING, API_BASE_URL, BEHANDLINGER, FAGSAKER } from "../../api-constants";
import { InntektskildeDto, SkatteforholdDto } from "../trygdeavgift";
import { Medlemskapsperiode } from "../medlemavfolketrygden/medlemskapsperioder";

export interface AarsavregningResponse {
  aarsavregningID: number;
  aar: number;
  tidligereGrunnlagsopplysninger?: Grunnlagsopplysninger;
  harAvvik?: boolean;
  nyttGrunnlag?: Grunnlagsopplysninger;
  avregning?: Avregning;
  harDeltGrunnlag?: boolean;
  behandlingsvalg?: string;
  avgift25Prosent?: string;
}
// TODO: Fix typing for behandlingsvalg

export interface AarsavregningRequest {
  avregning: Avregning;
}

export interface OppdaterHarDeltGrunnlagRequest {
  harDeltGrunnlag: boolean;
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
  tidligereFakturertBeloepAvgiftssystem?: number;
  avgift25Prosent?: number;
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

export const oppdaterHarDeltGrunnlag = (
  behandlingID: number,
  request: OppdaterHarDeltGrunnlagRequest,
): Promise<AarsavregningResponse> =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${AARSAVREGNING}/grunnlagstype`, request);

export const oppdaterAvvik = (
  behandlingID: number,
  harAvvik: boolean,
  aarsavregningID?: number,
): Promise<AarsavregningResponse> =>
  putAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${AARSAVREGNING}/${aarsavregningID}/harAvvik/${harAvvik}`);

export const oppdaterBehandlingsvalg = (
  behandlingID: number,
  behandlingsvalg: string,
  aarsavregningID?: number,
): Promise<AarsavregningResponse> =>
  putAsJson(
    `${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${AARSAVREGNING}/${aarsavregningID}/behandlingsvalg/${behandlingsvalg}`,
  );

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
export const oppdaterTotalAvgift = async (behandlingID: number, aarsavregningID: number, totalAvgift?: number) => {
  return oppdaterAarsavregning(
    behandlingID,
    {
      avregning: {
        nyttTotalbeloep: totalAvgift,
      },
    },
    aarsavregningID,
  );
};
export const oppdaterAvgift25Prosent = async (
  behandlingID: number,
  aarsavregningID: number,
  avgift25Prosent?: number,
) => {
  return oppdaterAarsavregning(
    behandlingID,
    {
      avregning: {
        avgift25Prosent,
      },
    },
    aarsavregningID,
  );
};
export const oppdaterAarsavregning = (
  behandlingID: number,
  request: AarsavregningRequest,
  aarsavregningID?: number,
): Promise<AarsavregningResponse> => {
  return putAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${AARSAVREGNING}/${aarsavregningID}`, request);
};
