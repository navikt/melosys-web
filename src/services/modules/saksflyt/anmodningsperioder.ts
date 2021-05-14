import { postAsJson } from "../../utils";
import { API_BASE_URL, SAKSFLYT, ANMODNINGSPERIODER } from "../../api-constants";

interface Vedlegg {
  journalpostID: string;
  dokumentID: string;
}

export interface AnmodningOmUnntakBestillingReqDto {
  mottakerinstitusjon: string | null;
  fritekstSed: string | null;
  vedlegg: Vedlegg[];
}

export interface AnmodningOmUnntakSvarReqDto {
  behandlingID: number;
  ytterligereInfo: string | null;
}

export const bestill = (behandlingID: number, body: AnmodningOmUnntakBestillingReqDto) =>
  postAsJson(`${API_BASE_URL}${SAKSFLYT}/${ANMODNINGSPERIODER}/${behandlingID}/bestill`, body);

export const svar = (body: AnmodningOmUnntakSvarReqDto) =>
  postAsJson(`${API_BASE_URL}${SAKSFLYT}/${ANMODNINGSPERIODER}/svar`, body);
