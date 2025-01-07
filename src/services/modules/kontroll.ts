import { getAsJson, postAsJson } from "../utils";
import { API_BASE_URL, KONTROLL } from "../api-constants";

export interface FerdigbehandlingKontrollData {
  behandlingID: number;
  vedtakstype: string | null;
  behandlingsresultattype?: string;
  kontrollerSomSkalIgnoreres?: string[];
  skalRegisteropplysningerOppdateres: boolean;
}

export interface AnmodningOmUnntakKontrollData {
  behandlingID: number;
}

export interface RegistrertAdresseData {
  brukerID?: string | null;
  orgnr?: string | null;
  behandlingID?: number | null;
}

export const kontrollerFerdigbehandling = (data: FerdigbehandlingKontrollData) =>
  postAsJson(`${API_BASE_URL}${KONTROLL}/ferdigbehandling`, data);

export const kontrollerAnmodningOmUnntak = (data: AnmodningOmUnntakKontrollData) =>
  postAsJson(`${API_BASE_URL}${KONTROLL}/anmodningomunntak`, data);

export const kontrollerAdresse = (data: RegistrertAdresseData) =>
  postAsJson(`${API_BASE_URL}${KONTROLL}/adresse`, data);

export const erBucAapen = (behandlingID: number) => getAsJson(`${API_BASE_URL}${KONTROLL}/${behandlingID}/erBucAapen`);

export interface PeriodeKontrollData {
  periodeFom: Date;
  periodeTom: Date;
}

export const kontrollerUnntaksperiode = (behandlingID: number, data: PeriodeKontrollData) =>
  postAsJson(`${API_BASE_URL}${KONTROLL}/${behandlingID}/unntaksperiode`, data);
