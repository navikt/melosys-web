import { postAsJson } from "../../utils";
import { API_BASE_URL, SAKSFLYT, VEDTAK } from "../../api-constants";
import { KopiMottaker } from "../dokumenter-v2";

export type FattVedtakReqDto =
  | FattVedtakEOSReqDto
  | FattVedtakFTRLReqDto
  | FattVedtakTrygdeavtaleReqDto
  | FattVedtakÅrsavregningReqDto;

export interface FattVedtakÅrsavregningReqDto {
  behandlingsresultatTypeKode: string;
  innledningFritekst?: string | null;
  begrunnelseFritekst?: string | null;
  vedtakstype: string | null;
  kopiMottakere?: KopiMottaker[];
}

export interface FattVedtakEOSReqDto {
  behandlingsresultatTypeKode: string;
  vedtakstype: string | null;
  begrunnelseFritekst?: string | null;
  fritekst?: string | null;
  fritekstSed?: string | null;
  mottakerinstitusjoner: string[];
  nyVurderingBakgrunn: string | null;
}

export interface FattVedtakFTRLReqDto {
  behandlingsresultatTypeKode: string;
  innledningFritekst?: string | null;
  begrunnelseFritekst?: string | null;
  trygdeavgiftFritekst?: string | null;
  vedtakstype: string;
  kopiMottakere?: KopiMottaker[];
  nyVurderingBakgrunn?: string | null;
  opphoerDato?: string | null;
}

export interface FattVedtakTrygdeavtaleReqDto {
  behandlingsresultatTypeKode: string;
  vedtakstype: string | null;
  innledningFritekst: string | null;
  begrunnelseFritekst: string | null;
  ektefelleFritekst: string | null;
  barnFritekst: string | null;
  kopiMottakere: KopiMottaker[];
  nyVurderingBakgrunn: string | null | undefined;
}

export const fatt = (behandlingID: number, data: FattVedtakReqDto) =>
  postAsJson(`${API_BASE_URL}${SAKSFLYT}/${VEDTAK}/${behandlingID}/fatt`, data);
