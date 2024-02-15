import { getAsJson } from "../../utils";
import { API_BASE_URL, FTRL } from "../../api-constants";
import * as QS from "qs";

export const hentBestemmelser = (
  behandlingstema: string,
  trygdedekning?: string
): Promise<{ bestemmelser: string[] }> => {
  const params = QS.stringify({ behandlingstema, trygdedekning });
  return getAsJson(`${API_BASE_URL}${FTRL}/bestemmelser/?${params}`);
};

export const hentPliktigeBestemmelser = (): Promise<{ bestemmelser: string[] }> =>
  getAsJson(`${API_BASE_URL}${FTRL}/bestemmelser/pliktige`);
