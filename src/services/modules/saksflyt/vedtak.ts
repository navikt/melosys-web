import { postAsJson } from "../../utils";
import { API_BASE_URL, SAKSFLYT, VEDTAK } from "../../api-constants";
import { KopiMottaker } from "../dokumenter-v2";

export type FattVedtakReqDto = FattVedtakEOSReqDto | FattVedtakFTRLReqDto | FattVedtakTrygdeavtaleReqDto;

export interface FattVedtakEOSReqDto {
  behandlingsresultatTypeKode: string;
  vedtakstype: string | null;
  fritekst?: string | null;
  fritekstSed?: string | null;
  mottakerinstitusjoner: string[];
  revurderBegrunnelse: string | null;
}

export interface FattVedtakFTRLReqDto {
  behandlingsresultatTypeKode: string;
  vedtakstype: string | null;
  fritekstInnledning: string | null;
  fritekstBegrunnelse: string | null;
  fritekstEktefelle: string | null;
  fritekstBarn: string | null;
  kopiMottakere: KopiMottaker[];
}
export type FattVedtakTrygdeavtaleReqDto = FattVedtakFTRLReqDto;

interface EndreVedtakReqDto {
  begrunnelseKode: string;
  fritekst?: string | null;
  fritekstSed?: string | null;
}

export const fatt = (behandlingID: number, data: FattVedtakReqDto) =>
  postAsJson(`${API_BASE_URL}${SAKSFLYT}/${VEDTAK}/${behandlingID}/fatt`, data);

export const endre = (behandlingID: number, data: EndreVedtakReqDto) =>
  postAsJson(`${API_BASE_URL}${SAKSFLYT}/${VEDTAK}/${behandlingID}/endre`, data);

export const kontroller = (behandlingID: number, oppdater: boolean, data: FattVedtakReqDto) =>
  postAsJson(
    `${API_BASE_URL}${SAKSFLYT}/${VEDTAK}/${behandlingID}/kontroller?oppdaterRegisteropplysninger=${oppdater}`,
    data
  );
