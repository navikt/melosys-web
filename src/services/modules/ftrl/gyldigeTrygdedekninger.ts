import { getAsJson } from "../../utils";
import { API_BASE_URL, FTRL } from "../../api-constants";

export const hentGyldigeTrygdedekninger = (behandlingID: number): Promise<string[]> =>
  getAsJson(`${API_BASE_URL}${FTRL}/gyldige-trygdedekninger/${behandlingID}`);
