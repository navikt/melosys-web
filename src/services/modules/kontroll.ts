import { postAsJson } from "../utils";
import { API_BASE_URL, KONTROLL } from "../api-constants";

export type FerdigbehandlingKontrollData = {
  behandlingID: number;
  vedtakstype: string | null;
  behandlingsresultattype: string;
  kontrollerSomSkalIgnoreres?: string[];
  skalRegisteropplysningerOppdateres: boolean;
};

export const kontrollerFerdigbehandling = (data: FerdigbehandlingKontrollData) =>
  postAsJson(`${API_BASE_URL}${KONTROLL}/ferdigbehandling`, data);

export type PeriodeKontrollData = {
  periodeFom: Date;
  periodeTom: Date;
};

export const kontrollerUnntaksperiode = (behandlingID: number, data: PeriodeKontrollData) =>
  postAsJson(`${API_BASE_URL}${KONTROLL}/${behandlingID}/unntaksperiode`, data);
