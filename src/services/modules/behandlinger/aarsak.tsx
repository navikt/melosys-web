import { getAsJson } from "../../utils";
import { API_BASE_URL } from "../../api-constants";

export type MottaksdatoResponse = {
  mottaksdato?: string;
};
export const hentMottaksdato = (behandlingID: string): Promise<MottaksdatoResponse> =>
  getAsJson(`${API_BASE_URL}behandlingsaarsak/${behandlingID}/mottaksdato`);
