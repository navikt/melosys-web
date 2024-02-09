import { getAsJson } from "../../utils";
import { API_BASE_URL, FTRL } from "../../api-constants";

export const hentGyldigeTrygdedekninger = (behandlingstema: string): Promise<string[]> =>
  getAsJson(`${API_BASE_URL}${FTRL}/trygdedekninger/?behandlingstema=${behandlingstema}`);
