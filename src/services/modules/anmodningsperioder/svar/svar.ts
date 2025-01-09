import { postAsJson, getAsJson } from "../../../utils";
import { API_BASE_URL, ANMODNINGSPERIODER, SVAR } from "../../../api-constants";

export interface AnmodningsperiodesvarResDto {
  anmodningsperiodeSvarType: string | null;
  endretPeriode: {
    fom: string | null;
    tom: string | null;
  };
  begrunnelseFritekst: string | null;
}

export const hent = (anmodningsperiodeID: number): Promise<AnmodningsperiodesvarResDto> =>
  getAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${anmodningsperiodeID}/${SVAR}`);

interface AnmodningsperiodesvarReqDto {
  anmodningsperiodeSvarType: string;
  endretPeriode: {
    fom: string | null;
    tom: string | null;
  };
  begrunnelseFritekst: string;
}

export const send = (
  anmodningsperiodeID: number,
  body: AnmodningsperiodesvarReqDto,
): Promise<AnmodningsperiodesvarResDto> =>
  postAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${anmodningsperiodeID}/${SVAR}`, body);
