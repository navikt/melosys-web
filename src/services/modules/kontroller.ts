import { postAsJson } from "../utils";
import { API_BASE_URL, KONTROLL } from "../api-constants";

export type FerdigbehandlingKontrollerData = {
  behandlingID: number;
  vedtakstype: string | null;
  behandlingsresultattype: string;
  skalRegisteropplysningerOppdateres: boolean;
};

export const kontrollerFerdigbehandling = (data: FerdigbehandlingKontrollerData) =>
  postAsJson(`${API_BASE_URL}${KONTROLL}/ferdigbehandling`, data);
