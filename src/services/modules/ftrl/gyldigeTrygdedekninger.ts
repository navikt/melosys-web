import { getAsJson } from "../../utils";
import { API_BASE_URL, FTRL } from "../../api-constants";
import * as QS from "qs";

export const hentGyldigeTrygdedekninger = (behandlingstema: string, bestemmelse?: string): Promise<string[]> => {
  const params = QS.stringify({ behandlingstema, bestemmelse });
  return getAsJson(`${API_BASE_URL}${FTRL}/trygdedekninger/?${params}`);
};
