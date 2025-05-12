import { getAsJson } from "../../utils";
import { API_BASE_URL, BEHANDLINGER } from "../../api-constants";

export interface MottaksdatoResponse {
  mottaksdato?: string;
}
export const hentMottaksdato = (behandlingID: number): Promise<MottaksdatoResponse> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/aarsak/mottaksdato`);
