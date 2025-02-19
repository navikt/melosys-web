import { getAsJson } from "../../utils";
import { API_BASE_URL, FTRL } from "../../api-constants";

export const hentGyldigeInnvilgelsesresultat = (behandlingstype: string): Promise<string[]> =>
  getAsJson(`${API_BASE_URL}${FTRL}/innvilgelsesresultat/?behandlingstype=${behandlingstype}`);
