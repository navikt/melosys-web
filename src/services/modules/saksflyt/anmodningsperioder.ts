import { postAsJson } from "../../utils";
import { API_BASE_URL, SAKSFLYT, ANMODNINGSPERIODER } from "../../api-constants";

interface Vedlegg {
  journalpostID: string;
  dokumentID: string;
}

export interface AnmodningOmUnntakBestillingReqDto {
  mottakerinstitusjon: string | null;
  fritekstSed: string | null;
  erFjernarbeidTWFA?: boolean | null;
  vedlegg: Vedlegg[];
}

export interface AnmodningOmUnntakSvarReqDto {
  ytterligereInfo: string | null;
}

export const bestill = (behandlingID: number, body: AnmodningOmUnntakBestillingReqDto) =>
  postAsJson(`${API_BASE_URL}${SAKSFLYT}/${ANMODNINGSPERIODER}/${behandlingID}/bestill`, body);

export const svar = (behandlingID: number, body: AnmodningOmUnntakSvarReqDto) =>
  postAsJson(`${API_BASE_URL}${SAKSFLYT}/${ANMODNINGSPERIODER}/${behandlingID}/svar`, body);
