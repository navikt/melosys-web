import { postAsJson } from "../utils";
import { API_BASE_URL, KONTROLL } from "../api-constants";

export type FerdigbehandlingKontrollData = {
  behandlingID: number;
  vedtakstype: string | null;
  behandlingsresultattype: string;
  skalRegisteropplysningerOppdateres: boolean;
};

export const kontrollerFerdigbehandling = (data: FerdigbehandlingKontrollData) =>
  postAsJson(`${API_BASE_URL}${KONTROLL}/ferdigbehandling`, data);

export type GodkjennUnntaksperiodeKontrollData = {
  behandlingID: number;
};

export const kontrollerGodkjennUnntaksperiode = (data: GodkjennUnntaksperiodeKontrollData) =>
  postAsJson(`${API_BASE_URL}${KONTROLL}/godkjenn-unntaksperiode`, data);
