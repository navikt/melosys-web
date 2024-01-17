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
  nyVurderingBakgrunn: string | null;
}

export interface FattVedtakFTRLReqDto {
  behandlingsresultatTypeKode: string;
  vedtakstype: string;
  innledningFritekst?: string | null;
  begrunnelseFritekst?: string | null;
  trygdeavgiftFritekst?: string | null;
  kopiMottakere?: KopiMottaker[];
  nyVurderingBakgrunn?: string | null;
  opphoerDato?: string | null;
}

export type FattVedtakTrygdeavtaleReqDto = {
  behandlingsresultatTypeKode: string;
  vedtakstype: string | null;
  innledningFritekst: string | null;
  begrunnelseFritekst: string | null;
  ektefelleFritekst: string | null;
  barnFritekst: string | null;
  kopiMottakere: KopiMottaker[];
  nyVurderingBakgrunn: string | null | undefined;
};

interface EndreVedtakReqDto {
  begrunnelseKode: string;
  fritekst?: string | null;
  fritekstSed?: string | null;
}

export const fatt = (behandlingID: number, data: FattVedtakReqDto) =>
  postAsJson(`${API_BASE_URL}${SAKSFLYT}/${VEDTAK}/${behandlingID}/fatt`, data);

export const endre = (behandlingID: number, data: EndreVedtakReqDto) =>
  postAsJson(`${API_BASE_URL}${SAKSFLYT}/${VEDTAK}/${behandlingID}/endre`, data);
