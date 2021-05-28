import { getAsJson, postAsJson } from "../../utils";
import { FLYT_BASE_URL } from "../../api-constants";
import { StegNavn } from "../../../kodeverk/koder";

export interface Resultat {
  fom?: string;
  tom?: string;
  land?: string[];
  virksomheter?: string[];
  vedtakValg?: string;
  innvilgelseValg?: string;
  bestemmelseValg?: string;
}

export interface StegData {
  steg: StegNavn;
  status: string;
  virksomheter?: string[];
  vedtakValg?: string[];
  innvilgelseValg?: string[];
  bestemmelseValg?: Map<string, string>[];
  barn?: string[];
  ektefelle?: string;
  resultat?: Resultat;
}

export type StegDataResDto = StegData[];

export interface StegDataReqDto {
  stegId: StegNavn;
  stegData: {
    fom?: string;
    tom?: string;
    land?: string[];
    virksomheter?: string[];
  };
}

export const hentStegData = (behandlingID: number): Promise<StegDataResDto> =>
  getAsJson(`${FLYT_BASE_URL}${behandlingID}`);

export const sendStegData = (behandlingID: number, data: StegDataReqDto): Promise<StegDataResDto> =>
  postAsJson(`${FLYT_BASE_URL}${behandlingID}`, data);
