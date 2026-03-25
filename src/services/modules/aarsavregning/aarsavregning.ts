import { getAsJson, postAsJson, putAsJson } from "../../utils";
import { AARSAVREGNING, API_BASE_URL, BEHANDLINGER, FAGSAKER } from "../../api-constants";
import { Beregningstype, InntektskildeDto, SkatteforholdDto } from "../trygdeavgift";
import { Avgiftspliktigperiode } from "../types/periodeTyper";

export interface AarsavregningResponse {
  aarsavregningID: number;
  aar: number;
  tidligereTrygdeavgiftsGrunnlagsopplysninger?: Grunnlagsopplysninger;
  sisteGjeldendeAvgiftspliktigperioder?: Avgiftspliktigperiode[];
  nyttTrygdeavgiftsGrunnlag?: Grunnlagsopplysninger;
  avregning?: Avregning;
  harTrygdeavgiftFraAvgiftssystemet?: boolean;
  endeligAvgiftValg?: string;
  harSkjoennsfastsattInntekt?: boolean;
}

export interface AarsavregningRequest {
  avregning: Omit<Avregning, "tidligereFakturertBeloep">;
}

export interface OppdaterHarTrygdeavgiftFraAvgiftssystemetRequest {
  harTrygdeavgiftFraAvgiftssystemet: boolean;
}

export interface OppdaterHarSkjoennsfastsattInntektRequest {
  harSkjoennsfastsattInntekt: boolean;
}

export interface Grunnlagsopplysninger {
  trygdeavgiftsgrunnlag: Trygdeavgiftsgrunnlag;
  avgift: Avgift;
  tidligereTrygdeavgiftFraAvgiftssystemet?: number;
  tidligereÅrsavregningManueltAvgiftBeloep?: number;
}

export interface Trygdeavgiftsgrunnlag {
  avgiftspliktigperioder: Avgiftspliktigperiode[];
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
  avgiftssats: number | null;
  avgiftPerMd: number;
  beregningstype?: Beregningstype | null;
  harSammenslåtteInntektskilder?: boolean;
}

export interface Avregning {
  beregnetAvgiftBelop?: number;
  tidligereFakturertBeloep?: number;
  tilFaktureringBeloep?: number;
  trygdeavgiftFraAvgiftssystemet?: number;
  manueltAvgiftBeloep?: number;
}

export interface AarsavregningListResponse {
  aarsavregningId: number;
  behandlingID: number;
  aar: number;
  resultattype: {
    kode: string;
    term: string;
  };
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

export const oppdaterHarTrygdeavgiftFraAvgiftssystemet = (
  behandlingID: number,
  request: OppdaterHarTrygdeavgiftFraAvgiftssystemetRequest,
): Promise<AarsavregningResponse> =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${AARSAVREGNING}/grunnlagstype`, request);

export const oppdaterHarSkjoennsfastsattInntekt = (
  behandlingID: number,
  value: boolean,
): Promise<AarsavregningResponse> =>
  postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${AARSAVREGNING}/skjoennsfastsatt`, {
    harSkjoennsfastsattInntekt: value,
  });

export const oppdaterEndeligAvgiftValg = (
  behandlingID: number,
  endeligAvgiftValg: string,
  aarsavregningID?: number,
): Promise<AarsavregningResponse> =>
  putAsJson(
    `${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/${AARSAVREGNING}/${aarsavregningID}/endeligAvgift/${endeligAvgiftValg}`,
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

export const oppdaterManueltAvgiftBeloep = async (
  behandlingID: number,
  aarsavregningID: number,
  manueltAvgiftBeloep?: number,
) => {
  return oppdaterAarsavregning(
    behandlingID,
    {
      avregning: {
        manueltAvgiftBeloep,
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
